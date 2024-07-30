import { Listener, container } from '@sapphire/framework';
import { UserDisinterestedInEvent } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import { CustomEvents } from '../../../lib/events.js';
import { userMention } from 'discord.js';

export class verboseLogUserDisinterestedInEventListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'verboseLogUserDisinterestedInEvent',
			emitter: container.events,
			event: CustomEvents.UserDisinterestedInEvent
		});
	}
	run(e: UserDisinterestedInEvent) {
		getChannelAndSend(`User ${userMention(e.userId)} is no longer interested in ${e.guildScheduledEvent.name}`);
	}
}
