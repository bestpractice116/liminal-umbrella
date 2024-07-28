import { Listener, Events } from '@sapphire/framework';
import { GuildScheduledEvent, User } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildScheduledEventUserRemoveEvent extends Listener {
	constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.GuildScheduledEventUserRemove
		});
	}

	@Sequential
	public override async run(guildScheduledEvent: GuildScheduledEvent, user: User) {
		await this.container.database.removeUserInterestedInEvent(user, guildScheduledEvent);
	}
}
