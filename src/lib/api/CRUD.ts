import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import type { SchemaBundle } from 'common/schema';
import { getSchemaKeys } from 'common';
import { Admin as AuthenticatedAdmin } from '../api/decorators.js';
import { Sequential } from '../utils.js';
import { z } from 'zod';
import { Model, ModelStatic, OrderItem } from '@sequelize/core';

export type CRUDWhere = Record<string, string | number | boolean | null>;

type SequelizeInclude =
    | string
    | {
            association: string;
            required?: boolean;
            separate?: boolean;
            include?: SequelizeInclude[];
            right?: boolean;
            where?: CRUDWhere;
      };

export enum MutationOperation {
    CREATE,
    UPDATE,
    DELETE
}

export function zodParseOrError<T extends z.ZodTypeAny>(schema: T, input: unknown, response: ApiResponse) {
    const result = schema.safeParse(input);
    if (!result.success) {
        response.status(HttpCodes.BadRequest).json({ status: 'error', error: result.error.issues });
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.data as z.infer<T>;
}


// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export async function findItem<T extends z.ZodTypeAny>(
    findSchema: T | undefined,
    params: unknown,
    model: ModelStatic,
    where: CRUDWhere,
    response: ApiResponse
): Promise<Model | null> {
    if (!findSchema) {
        response.notFound(); 
        return null;
    }
    const data = zodParseOrError(findSchema, params, response);
    if (!data) return null;
    const item: Model | null = await model.findOne({ where: { ...data, ...where } });
    if (!item) {
        response.status(HttpCodes.NotFound).json({ status: 'error', error: 'Item not found' });
        return null;
    }
    return item;
}

export type ReadObject = Record<string, string | number | null | undefined>

export interface CRUDReadable {
    get(key: string): unknown;
    CRUDRead?(key: string): Promise<unknown>;
}

export interface CRUDSaveable {
    set(arg0: unknown): void;
    CRUDSave?(): Promise<void>
    save(): Promise<Model>
}

export interface CRUDDestroyable {
    destroy(): Promise<void>
    CRUDDestroy?(): Promise<void>
}

abstract class CRUDBase extends Route {
    abstract getModel(): ModelStatic;
    abstract getSchema(): SchemaBundle;

    async getReadObjectFromDbObject(item?: CRUDReadable): Promise<ReadObject | null> {
        const schema = this.getSchema().read;
        if (!item) return null;
        const schemaKeys = getSchemaKeys(schema);
        return schemaKeys.reduce<Promise<ReadObject>>(async (acc, cv) => {
            const out: ReadObject = await acc;
            const val = item.CRUDRead ? await item.CRUDRead(cv) : item.get(cv);
            if (typeof val !== 'undefined' && val !== null) {
                out[cv] = val as string | number;
            }
            return out;
        }, Promise.resolve({}));
    }
}

export abstract class CR extends CRUDBase {
    async findAllWhere(_request: ApiRequest): Promise<CRUDWhere> {
        return {};
    }
    findAllOrder(): OrderItem[] {
        return [];
    }
    async onMutation(_item: unknown, _op: MutationOperation) {}

    findAllInclude(): SequelizeInclude[] {
        return [];
    }

    // Get current list
    @AuthenticatedAdmin
    async auth_GET(_request: ApiRequest, _response: ApiResponse) {}

    @Sequential
    public async [methods.GET](request: ApiRequest, response: ApiResponse) {
        await this.auth_GET(request, response);
        if (response.writableEnded) {
            return;
        }
        const items = await this.getModel().findAll({
            where: await this.findAllWhere(request),
            include: this.findAllInclude(),
            order: this.findAllOrder()
        });
        // FIXME - any
        const res = await Promise.all(items.map(async (item: Model) => this.getReadObjectFromDbObject(item)));
        response.json(res);
    }

    // Add a new one
    @AuthenticatedAdmin
    async auth_CREATE(_request: ApiRequest, _response: ApiResponse) {}

    async CREATE_coerce(_request: ApiRequest, _response: ApiResponse, data: unknown): Promise<unknown> {
        return data;
    }

    getSchemaCreate(): z.ZodTypeAny | undefined {
        return this.getSchema().create;
    }

    @Sequential
    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
        await this.auth_CREATE(request, response);
        if (response.writableEnded) {
            return;
        }

         
        const createSchema = this.getSchemaCreate();
        if (!createSchema) {
            response.notFound(); return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = zodParseOrError(createSchema, request.body, response);
        if (!data) return;
        const dbData = await this.CREATE_coerce(request, response, data);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (response.writableEnded) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        const item = await this.getModel().create(dbData as any);
        await this.onMutation(item, MutationOperation.CREATE);
        const datum = await this.getReadObjectFromDbObject(item);
        response.status(HttpCodes.Created).json({ status: 'ok', datum });
    }

    // We don't allow delete using params in the body by default.
    @AuthenticatedAdmin
    async auth_DELETE(_request: ApiRequest, response: ApiResponse) {
        response.notFound();
    }

    async getRetrieveWhere(_request: ApiRequest): Promise<CRUDWhere> {
        return {};
    }

    public async DELETE_disallowed(_item: unknown, _request: ApiRequest): Promise<string | undefined> {
        return;
    }

    protected async findItem(request: ApiRequest, response: ApiResponse): Promise<Model | null> {
        return findItem(this.getSchema().find, request.body, this.getModel(), await this.getRetrieveWhere(request), response);
    }

    @Sequential
    public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
        await this.auth_DELETE(request, response);
        if (response.writableEnded) {
            return;
        }
        if (!this.getSchema().delete) {
            response.notFound(); return;
        }
        const item = await this.findItem(request, response);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (response.writableEnded) {
            return;
        }
        const deleteError = await this.DELETE_disallowed(item, request);
        if (deleteError) {
            response.error(HttpCodes.MethodNotAllowed, deleteError); return;
        }
        await item!.destroy();
        await this.onMutation(item, MutationOperation.DELETE);
        response.json({ status: 'deleted', datum: request.body });
    }
}

export abstract class UD extends CRUDBase {
    async getRetrieveWhere(_request: ApiRequest): Promise<CRUDWhere> {
        return {};
    }
    async onMutation(_item: unknown, _op: MutationOperation) {}

    getSchemaFind(): z.ZodTypeAny | undefined {
        return this.getSchema().find;
    }

    protected async findItem(request: ApiRequest, response: ApiResponse): Promise<Model | null> {
        return findItem(this.getSchemaFind(), request.params, this.getModel(), await this.getRetrieveWhere(request), response);
    }

    @AuthenticatedAdmin
    async auth_GET(_request: ApiRequest, _response: ApiResponse) {}

    @Sequential
    public async [methods.GET](request: ApiRequest, response: ApiResponse) {
        await this.auth_GET(request, response);
        if (response.writableEnded) {
            return;
        }
        const item = await this.findItem(request, response);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (response.writableEnded) {
            return;
        }
        response.json(await this.getReadObjectFromDbObject(item!));
    }

    @AuthenticatedAdmin
    async auth_UPDATE(_request: ApiRequest, _response: ApiResponse) {}

    async UPDATE_coerce(_request: ApiRequest, _response: ApiResponse, data: unknown): Promise<unknown> {
        return data;
    }

    getSchemaUpdate(): z.ZodTypeAny | undefined {
        return this.getSchema().update;
    }

    public UPDATE_disallowed(_item: unknown): string | undefined {
        return;
    }

    @Sequential
    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
        await this.auth_UPDATE(request, response);
        if (response.writableEnded) {
            return;
        }
        const updateSchema = this.getSchemaUpdate();
        if (!updateSchema) {
            response.notFound(); return;
        }
        const item = (await this.findItem(request, response)) as CRUDSaveable & CRUDReadable;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (response.writableEnded) {
            return;
        }
        const updateError = this.UPDATE_disallowed(item);
        if (updateError) {
            response.error(HttpCodes.MethodNotAllowed, updateError); return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = zodParseOrError(updateSchema, request.body, response);
        if (!data) return;
        const dbData = await this.UPDATE_coerce(request, response, data);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (response.writableEnded) {
            return;
        }
        item.set(dbData);
        if (item.CRUDSave) {
            await item.CRUDSave();
         } else {
            await item.save();
         }
        await this.onMutation(item, MutationOperation.UPDATE);
        const datum = await this.getReadObjectFromDbObject(item);
        response.json({ status: 'ok', datum });
    }

    @AuthenticatedAdmin
    async auth_DELETE(_request: ApiRequest, _response: ApiResponse) {}

    public async DELETE_disallowed(_item: unknown, _request: ApiRequest): Promise<string | undefined> {
        return;
    }

    @Sequential
    public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
        await this.auth_DELETE(request, response);
        if (response.writableEnded) {
            return;
        }
        if (!this.getSchema().delete) {
            response.notFound(); return;
        }
        const item = await this.findItem(request, response) as CRUDDestroyable;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (response.writableEnded) {
            return;
        }
        const deleteError = await this.DELETE_disallowed(item, request);
        if (deleteError) {
            response.error(HttpCodes.MethodNotAllowed, deleteError); return;
        }
        if (item.CRUDDestroy) {
            await item.CRUDDestroy();
        } else {
            await item.destroy();
        }
        await this.onMutation(item, MutationOperation.DELETE);
        response.json({ status: 'deleted', datum: request.params });
    }
}
