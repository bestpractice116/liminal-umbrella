import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSystem, PlannedGame } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { GameSchema } from 'common/schema';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';

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
		return GameSchema;
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_UPDATE() {}

	override async UPDATE_coerce(_request: ApiRequest, _response: ApiResponse, data: any) {
		const gamesystem = await GameSystem.findOne({ where: { name: data.gamesystem } });
		if (gamesystem) {
			return { ...data, gamesystem: gamesystem.key };
		}
		return data;
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_DELETE() {}
}
