import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSystem, PlannedGame } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { NewGameSchema } from 'common/schema';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';
import { isAdmin } from '../lib/api/auth.js';

export class ApiGameEdit extends UD {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/game/:key'
		});
	}

	getModel() {
		return PlannedGame;
	}
	getSchema(): SchemaBundle {
		return NewGameSchema;
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_UPDATE() {}

	override async UPDATE_coerce(_request: ApiRequest, _response: ApiResponse, data: any) {
		if (data.gamesystem) {
			const gamesystem = await GameSystem.findOne({ where: { name: data.gamesystem } });
			if (gamesystem) {
				return { ...data, gamesystem: gamesystem.key };
			}
		}
		return data;
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_DELETE() {}

	override async getRetrieveWhere(request: ApiRequest) {
		if (isAdmin(request)) {
			return {};
		}
		return { owner: request.auth!.id };
	}
}
