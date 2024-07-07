import { Listener, container } from '@sapphire/framework';
import { TickOneTwenty } from '../lib/events/index.js';
import { Sequential } from '../lib/utils.js';

export class TickOneTwentyEvent extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'tickOneTwenty',
			emitter: container.events,
			event: 'tickOneTwenty'
		});
	}

	@Sequential
	run(e: TickOneTwenty) {
		return container.database.sync(e.guild);
	}
}
