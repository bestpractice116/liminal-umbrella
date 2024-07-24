import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import type { SchemaBundle, AnyZodSchema } from 'common/schema';
import { getSchemaKeys } from 'common';
import { AuthenticatedAdmin } from '../api/decorators.js';
import { Sequential } from '../utils.js';

type SequelizeInclude =
	| string
	| {
			association: string;
			required?: boolean;
			separate?: boolean;
			include?: SequelizeInclude[];
			right?: boolean;
			where?: any;
	  };

export function zodParseOrError(schema: AnyZodSchema, input: unknown, response: ApiResponse): any {
	const { success, error, data } = schema.safeParse(input);
	if (!success) {
		response.status(HttpCodes.BadRequest).json({ status: 'error', error: error.issues });
		return null;
	}
	return data;
}

export async function findItem(
	findSchema: AnyZodSchema | undefined,
	params: any,
	model: any,
	where: any,
	response: ApiResponse
): Promise<any | null> {
	if (!findSchema) {
		return response.notFound();
	}
	const data = zodParseOrError(findSchema, params, response);
	if (!data) return;
	const item = await model.findOne({ where: { ...data, ...where } });
	if (!item) {
		response.status(HttpCodes.NotFound).json({ status: 'error', error: 'Item not found' });
		return null;
	}
	return item;
}

abstract class CRUDBase extends Route {
	abstract getModel(): any;
	abstract getSchema(): SchemaBundle;

	async getReadObjectFromDbObject(item: any) {
		const schemaKeys = getSchemaKeys(this.getSchema().read);
		return schemaKeys.reduce(async (acc, cv) => {
			const out = { ...(await acc) } as any;
			const val = item.CRUDRead ? await item.CRUDRead(cv) : item.get(cv);
			if (typeof val !== 'undefined' && val !== null) {
				out[cv] = val;
			}
			return out;
		}, {});
	}
}

export abstract class CR extends CRUDBase {
	async findAllWhere(_request: ApiRequest): Promise<any> {
		return {};
	}
	findAllOrder(): string[][] {
		return [];
	}
	async onMutation(_item: any) {}

	findAllInclude(): SequelizeInclude[] {
		return [];
	}

	// Get current list
	@AuthenticatedAdmin()
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
		const res = await Promise.all(items.map(async (item: any) => await this.getReadObjectFromDbObject(item)));
		response.json(res);
	}

	// Add a new one
	@AuthenticatedAdmin()
	async auth_CREATE(_request: ApiRequest, _response: ApiResponse) {}

	async CREATE_coerce(_request: ApiRequest, _response: ApiResponse, data: any): Promise<any> {
		return data;
	}

	getSchemaCreate(): AnyZodSchema | undefined {
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
			return response.notFound();
		}
		const data = zodParseOrError(createSchema, request.body, response);
		if (!data) return;
		const dbData = await this.CREATE_coerce(request, response, data);
		if (response.writableEnded) {
			return;
		}
		const item = await this.getModel().create(dbData);
		await this.onMutation(item);
		const datum = await this.getReadObjectFromDbObject(item);
		response.status(HttpCodes.Created).json({ status: 'ok', datum });
	}

	// We don't allow delete using params in the body by default.
	@AuthenticatedAdmin()
	async auth_DELETE(_request: ApiRequest, response: ApiResponse) {
		return response.notFound();
	}

	async getRetrieveWhere(_request: ApiRequest): Promise<any> {
		return {};
	}

	public async DELETE_disallowed(_item: any, _request: ApiRequest): Promise<string | undefined> {
		return;
	}

	protected async findItem(request: ApiRequest, response: ApiResponse): Promise<any | null> {
		return findItem(this.getSchema().find, request.body, this.getModel(), await this.getRetrieveWhere(request), response);
	}

	@Sequential
	public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
		await this.auth_DELETE(request, response);
		if (response.writableEnded) {
			return;
		}
		if (!this.getSchema().delete) {
			return response.notFound();
		}
		const item = await this.findItem(request, response);
		if (!item) {
			return response.notFound();
		}
		const delete_error = await this.DELETE_disallowed(item, request);
		if (delete_error) {
			return response.error(HttpCodes.MethodNotAllowed, delete_error);
		}
		await item.destroy();
		await this.onMutation(item);
		response.json({ status: 'deleted', datum: request.body });
	}
}

export abstract class UD extends CRUDBase {
	async getRetrieveWhere(_request: ApiRequest): Promise<any> {
		return {};
	}
	async onMutation(_item: any) {}

	getSchemaFind(): AnyZodSchema | undefined {
		return this.getSchema().find;
	}

	protected async findItem(request: ApiRequest, response: ApiResponse): Promise<any | null> {
		return findItem(this.getSchemaFind(), request.params, this.getModel(), await this.getRetrieveWhere(request), response);
	}

	@AuthenticatedAdmin()
	async auth_GET(_request: ApiRequest, _response: ApiResponse) {}

	@Sequential
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		await this.auth_GET(request, response);
		if (response.writableEnded) {
			return;
		}
		const item = await this.findItem(request, response);
		response.json(await this.getReadObjectFromDbObject(item));
	}

	@AuthenticatedAdmin()
	async auth_UPDATE(_request: ApiRequest, _response: ApiResponse) {}

	async UPDATE_coerce(_request: ApiRequest, _response: ApiResponse, data: any): Promise<any> {
		return data;
	}

	getSchemaUpdate(): AnyZodSchema | undefined {
		return this.getSchema().update;
	}

	public UPDATE_disallowed(_item: any): string | undefined {
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
			return response.notFound();
		}
		const item = await this.findItem(request, response);
		if (!item) {
			return response.notFound();
		}
		const update_error = this.UPDATE_disallowed(item);
		if (update_error) {
			return response.error(HttpCodes.MethodNotAllowed, update_error);
		}
		const data = zodParseOrError(updateSchema, request.body, response);
		if (!data) return;
		const dbData = await this.UPDATE_coerce(request, response, data);
		if (response.writableEnded) {
			return;
		}
		item.set(dbData);
		item.CRUDSave ? await item.CRUDSave() : item.save();
		await item.save();
		await this.onMutation(item);
		const datum = await this.getReadObjectFromDbObject(item);
		response.json({ status: 'ok', datum });
	}

	@AuthenticatedAdmin()
	async auth_DELETE(_request: ApiRequest, _response: ApiResponse) {}

	public async DELETE_disallowed(_item: any, _request: ApiRequest): Promise<string | undefined> {
		return;
	}

	@Sequential
	public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
		await this.auth_DELETE(request, response);
		if (response.writableEnded) {
			return;
		}
		if (!this.getSchema().delete) {
			return response.notFound();
		}
		const item = await this.findItem(request, response);
		if (!item) {
			return response.notFound();
		}
		const delete_error = await this.DELETE_disallowed(item, request);
		if (delete_error) {
			return response.error(HttpCodes.MethodNotAllowed, delete_error);
		}
		await item.destroy();
		await this.onMutation(item);
		response.json({ status: 'deleted', datum: request.params });
	}
}
