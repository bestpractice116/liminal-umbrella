import { Route } from '@sapphire/plugin-api';
import { ActivityCacheClear } from '../lib/events/index.js';
import { Activity } from '../lib/database/model.js';
import { ActivitySchema } from 'common/schema';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';

export class ApiBotplayingEdit extends UD {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/botplaying/:key'
		});
	}

	getModel() {
		return Activity;
	}
	getSchema(): SchemaBundle {
		return ActivitySchema;
	}
	override async onMuatation() {
		this.container.events.emit('activityCacheClear', new ActivityCacheClear());
	}
}
