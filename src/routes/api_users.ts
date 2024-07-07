import { Route } from '@sapphire/plugin-api';
import { User } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';
import { UserSchema } from 'common/schema';

export class ApiBotpMessagesList extends CR {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/user'
		});
	}

	getModel() {
		return User;
	}
	getSchema(): SchemaBundle {
		return UserSchema;
	}
	override findAllInclude() {
		return ['roles'];
	}
	override getRetrieveWhere() {
		return { bot: false };
	}
}
