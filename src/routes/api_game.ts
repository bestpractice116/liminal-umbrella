import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSystem, PlannedGame } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';
import { NewGameSchema, AnyZodSchema } from 'common/schema';
import { getZObject } from 'common';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';
import { isAdmin } from '../lib/api/auth.js';

export class ApiGameList extends CR {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/game'
		});
	}

	getModel() {
		return PlannedGame;
	}
	getSchema(): SchemaBundle {
		return NewGameSchema;
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_GET() {}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_CREATE() {}

	override async CREATE_coerce(request: ApiRequest, response: ApiResponse, data: any): Promise<any> {
		const out = {
			...data,
			owner: request.auth!.id
		};
		if (data.gamesystem) {
			const gamesystem = await GameSystem.findOne({ where: { name: data.gamesystem } });
			if (!gamesystem) {
				return response.badRequest('Cannot find game system');
			}
			out['gamesystem'] = gamesystem.key;
		}
		return out;
	}

	override async findAllWhere(request: ApiRequest) {
		if (isAdmin(request)) {
			return {};
		}
		return { owner: request.auth!.id };
	}
}
