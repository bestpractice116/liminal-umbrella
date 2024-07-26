import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSessionUserSignup } from '../lib/database/model.js';
import { GameSessionUserSignupSchema } from 'common/schema';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';

export class ApiGameSessionUserSignups extends UD {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/gamesessionusersignups/:key'
		});
	}

	getModel() {
		return GameSessionUserSignup;
	}
	getSchema(): SchemaBundle {
		return GameSessionUserSignupSchema;
	}
	// There is no get one game signups endpoint
	override async auth_GET(_request: ApiRequest, response: ApiResponse) {
		return response.notFound();
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_DELETE(_request: ApiRequest, _response: ApiResponse) {}

	override async DELETE_disallowed(item: any, _request: ApiRequest): Promise<string | undefined> {
		const now = new Date(Date.now());
		if (item.startTime < now) {
			return 'Cannot delete game sessions which start in the past';
		}
		return;
	}
}
