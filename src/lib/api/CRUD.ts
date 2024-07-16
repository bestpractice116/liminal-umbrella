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
	async getRetrieveWhere(_request: ApiRequest): Promise<any> {
		return {};
	}
	onMuatation() {}

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
		const items = await this.getModel().findAll({ where: await this.getRetrieveWhere(request), include: this.findAllInclude() });
		// FIXME - any
		const res = await Promise.all(items.map(async (item: any) => await this.getReadObjectFromDbObject(item)));
		response.json(res);
	}

	// Add a new one
	@AuthenticatedAdmin()
	async auth_CREATE(_request: ApiRequest, _response: ApiResponse) {}

	async CREATE_coerce(request: ApiRequest, _response: ApiResponse, data: any): Promise<any> {
		data.owner = request.auth;
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
		const { success, error, data } = createSchema.safeParse(request.body);
		if (!success) {
			response.status(HttpCodes.BadRequest).json({ status: 'error', error: error.issues });
			return;
		}
		const dbData = await this.CREATE_coerce(request, response, data);
		if (response.writableEnded) {
			return;
		}
		const item = await this.getModel().create(dbData);
		this.onMuatation();
		const datum = await this.getReadObjectFromDbObject(item);
		response.status(HttpCodes.Created).json({ status: 'ok', datum });
	}
}

export abstract class UD extends CRUDBase {
	async getRetrieveWhere(_request: ApiRequest): Promise<any> {
		return {};
	}
	onMuatation(_item: any) {}

	getSchemaFind(): AnyZodSchema | undefined {
		return this.getSchema().find;
	}

	protected async findItem(request: ApiRequest, response: ApiResponse): Promise<any | null> {
		const findSchema = this.getSchemaFind();
		if (!findSchema) {
			return response.notFound();
		}
		const { success, error, data } = findSchema.safeParse(request.params);
		if (!success) {
			response.status(HttpCodes.BadRequest).json({ status: 'error', error: error.issues });
			return null;
		}
		const item = await this.getModel().findOne({ where: { ...data, ...(await this.getRetrieveWhere(request)) } });
		if (!item) {
			response.status(HttpCodes.NotFound).json({ status: 'error', error: 'Item not found' });
			return null;
		}
		return item;
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
			return;
		}
		const { success, error, data } = updateSchema.safeParse(request.body);
		if (!success) {
			response.status(HttpCodes.BadRequest).json({ status: 'error', error: error.issues });
			return;
		}
		const dbData = await this.UPDATE_coerce(request, response, data);
		if (response.writableEnded) {
			return;
		}
		item.set(dbData);
		await item.save();
		this.onMuatation(item);
		const datum = await this.getReadObjectFromDbObject(item);
		response.json({ status: 'ok', datum });
	}

	@AuthenticatedAdmin()
	async auth_DELETE(_request: ApiRequest, _response: ApiResponse) {}

	getSchemaDelete(): AnyZodSchema | undefined {
		return this.getSchema().update;
	}

	@Sequential
	public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
		await this.auth_DELETE(request, response);
		if (response.writableEnded) {
			return;
		}
		const deleteSchema = this.getSchemaDelete();
		if (!deleteSchema) {
			return response.notFound();
		}
		const item = await this.findItem(request, response);
		if (!item) {
			return;
		}
		await item.destroy();
		this.onMuatation(item);
		response.json({ status: 'deleted', datum: request.params });
	}
}
