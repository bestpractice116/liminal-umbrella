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

	// FIXME - allow
	override async auth_DELETE(_request: ApiRequest, response: ApiResponse) {
		response.notFound();
	}

	override DELETE_disallowed(item: any): string | undefined {
		const now = new Date(Date.now());
		if (item.startTime < now) {
			return 'Cannot delete game sessions which start in the past';
		}
		return;
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_UPDATE(_request: ApiRequest, _response: ApiResponse) {}

	override UPDATE_disallowed(item: any): string | undefined {
		const now = new Date(Date.now());
		if (item.starttime < now) {
			return 'Cannot update game sessions which start in the past';
		}
		return;
	}

	override async UPDATE_coerce(_request: ApiRequest, response: ApiResponse, data: any): Promise<any> {
		const date = new Date(data.date);
		const starttime = new Date(data.starttime!);
		starttime.setFullYear(date.getFullYear());
		starttime.setMonth(date.getMonth());
		starttime.setDate(date.getDate());
		const endtime = new Date(data.endtime)!;
		endtime.setFullYear(date.getFullYear());
		endtime.setMonth(date.getMonth());
		endtime.setDate(date.getDate());

		const now = new Date(Date.now());
		if (starttime < now) {
			// Session started in the past, not valid
		}
		if (endtime < starttime) {
			// End time cannot be before start time, not valid
		}

		const out = { ...data, starttime, endtime };
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
