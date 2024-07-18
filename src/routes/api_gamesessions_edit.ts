import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSession, GameSystem } from '../lib/database/model.js';
import { GameSchema } from 'common/schema';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';
import { isAdmin } from '../lib/api/auth.js';

export class ApiGameSessions extends UD {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/gamesessions/:key'
		});
	}

	getModel() {
		return GameSession;
	}
	getSchema(): SchemaBundle {
		return GameSchema;
	}
	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_GET() {}

	override async getRetrieveWhere(request: ApiRequest) {
		if (isAdmin(request)) return {};
		return { owner: request.auth!.id };
	}

	override async auth_DELETE(_request: ApiRequest, response: ApiResponse) {
		response.notFound();
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_UPDATE(_request: ApiRequest, _response: ApiResponse) {}

	override async UPDATE_coerce(_request: ApiRequest, response: ApiResponse, data: any): Promise<any> {
		const out = { ...data };
		if (data.gamesystem) {
			const gamesystem = await GameSystem.findOne({ where: { name: data.gamesystem } });
			if (!gamesystem) {
				return response.badRequest('Cannot find game system');
			}
			out['gamesystem'] = gamesystem.key;
		}
		return out;
	}
}
