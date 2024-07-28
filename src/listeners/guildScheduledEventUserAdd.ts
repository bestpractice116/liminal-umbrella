import { Listener, Events } from '@sapphire/framework';
import { GuildScheduledEvent, User } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildScheduledEventUserAddEvent extends Listener {
	constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.GuildScheduledEventUserAdd
		});
	}

	@Sequential
	public override async run(guildScheduledEvent: GuildScheduledEvent, user: User) {
		await this.container.database.addUserInterestedInEvent(user.id, guildScheduledEvent);
	}
}
