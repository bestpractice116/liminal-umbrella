import { Route } from '@sapphire/plugin-api';
import { BotMessage } from '../lib/database/model.js';
import { BotMessageSchema } from 'common/schema';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { BotMessageCacheClear } from '../lib/events/index.js';

export class ApiBotpMessagesEdit extends UD {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/botmessages/:key'
		});
	}

	getModel() {
		return BotMessage;
	}
	getSchema(): SchemaBundle {
		return BotMessageSchema;
	}
	override async onMutation() {
		this.container.events.emit('botMessageCacheClear', new BotMessageCacheClear());
	}
}
