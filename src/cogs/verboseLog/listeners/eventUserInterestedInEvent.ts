import { Listener, container } from '@sapphire/framework';
import { UserInterestedInEvent } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import { CustomEvents } from '../../../lib/events.js';
import { userMention } from 'discord.js';

export class verboseLogUserInterestedInEventListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'verboseLogUserInterestedInEvent',
			emitter: container.events,
			event: CustomEvents.UserInterestedInEvent
		});
	}
	run(e: UserInterestedInEvent) {
		getChannelAndSend(`User ${userMention(e.userId)} is interested in ${e.guildScheduledEvent.name}`);
	}
}
