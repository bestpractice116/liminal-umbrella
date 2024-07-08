import { Route } from '@sapphire/plugin-api';
import { PlannedGame } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';
import { GameSchema } from 'common/schema';

export class ApiBotpMessagesList extends CR {
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
		return GameSchema;
	}
}
