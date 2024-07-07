import { Listener, container } from '@sapphire/framework';
import { TickOneTwenty } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';

export class verboseLogTickOneTwentyListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'verboseLogTickOneTwenty',
			emitter: container.events,
			event: 'tickOneTwenty'
		});
	}
	run(e: TickOneTwenty) {
		container.logger.info('verboseLog cog - tickOneTwenty');
		getChannelAndSend(`Tick (2 hours): ${e.firedAt}`);
	}
}
