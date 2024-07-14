import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import type { SchemaBundle } from 'common/schema';
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

// FIXME - any
async function getReadObjectFromDbObject(that: any, item: any) {
	const schemaKeys = getSchemaKeys(that.getSchema().read);
	return schemaKeys.reduce(async (acc, cv) => {
		const out = { ...(await acc) } as any;
		out[cv] = item.CRUDRead ? await item.CRUDRead(cv) : item.get(cv);
		return out;
	}, {});
}

export abstract class CR extends Route {
	abstract getModel(): any;
	abstract getSchema(): SchemaBundle;
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
		const res = await Promise.all(items.map(async (item: any) => await getReadObjectFromDbObject(this, item)));
		response.json(res);
	}

	// Add a new one
	@AuthenticatedAdmin()
	async auth_CREATE(_request: ApiRequest, _response: ApiResponse) {}

	async CREATE_coerce(request: ApiRequest, _response: ApiResponse, data: any): Promise<any> {
		data.owner = request.auth;
		return data;
	}

	@Sequential
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		await this.auth_CREATE(request, response);
		if (response.writableEnded) {
			return;
		}

		const createSchema = this.getSchema().create;
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
		const datum = await getReadObjectFromDbObject(this, item);
		response.status(HttpCodes.Created).json({ status: 'ok', datum });
	}
}

export abstract class UD extends Route {
	abstract getModel(): any;
	abstract getSchema(): SchemaBundle;
	async getRetrieveWhere(_request: ApiRequest): Promise<any> {
		return {};
	}
	onMuatation() {}

	protected async findItem(request: ApiRequest, response: ApiResponse): Promise<any | null> {
		const findSchema = this.getSchema().find;
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
		return await getReadObjectFromDbObject(this, item);
	}

	@AuthenticatedAdmin()
	async auth_UPDATE(_request: ApiRequest, _response: ApiResponse) {}

	@Sequential
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		await this.auth_UPDATE(request, response);
		if (response.writableEnded) {
			return;
		}
		const updateSchema = this.getSchema().update;
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
		// TODO - No XSS
		item.set(data);
		await item.save();
		this.onMuatation();
		const datum = await getReadObjectFromDbObject(this, item);
		response.json({ status: 'ok', datum });
	}

	@AuthenticatedAdmin()
	async auth_DELETE(_request: ApiRequest, _response: ApiResponse) {}

	@Sequential
	public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
		await this.auth_DELETE(request, response);
		if (response.writableEnded) {
			return;
		}
		const deleteSchema = this.getSchema().delete;
		if (!deleteSchema) {
			return response.notFound();
		}
		const item = await this.findItem(request, response);
		if (!item) {
			return;
		}
		await item.destroy();
		this.onMuatation();
		response.json({ status: 'deleted', datum: request.params });
	}
}
