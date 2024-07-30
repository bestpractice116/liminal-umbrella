import { Listener, container } from '@sapphire/framework';
import { BotMessageCacheClear } from '../lib/events/index.js';
import { clearMessageCache } from '../lib/message.js';
import { CustomEvents } from '../lib/events.js';

export class BotMessageMessageCacheClearEvent extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'eventBotMessageCacheClear',
			emitter: container.events,
			event: CustomEvents.BotMessageCacheClear
		});
	}
	run(_: BotMessageCacheClear) {
		clearMessageCache();
	}
}
