import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { setRandomActivity } from '../activity.js';

export class randomActivityBotStartedListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'randomActivityBotStarted',
			emitter: container.events,
			event: 'botStarted'
		});
	}

	run(_: BotStarted) {
		// Set when we restart the bot + 1 second. (This just means that usually/mostly we'll get the 'RPGBot restarted' notice first... Done like this as it's simple and not critical the order.)
		setTimeout(setRandomActivity, 1000);
	}
}
