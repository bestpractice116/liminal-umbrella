import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSystem, PlannedGame } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { GameSchema, AnyZodSchema } from 'common/schema';
import { getZObject } from 'common';
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
		return GameSchema;
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

	override getSchemaUpdate(): AnyZodSchema | undefined {
		return getZObject(this.getSchema().update!).partial();
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
