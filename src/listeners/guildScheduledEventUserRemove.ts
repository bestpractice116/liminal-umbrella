import { Listener } from '@sapphire/framework';
import { GuildScheduledEvent, User } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildScheduledEventUserRemoveEvent extends Listener {
	@Sequential
	public override run(_guildScheduledEvent: GuildScheduledEvent, _user: User) {
		console.log(`Remove user from event ${_guildScheduledEvent.id} user ${_user.id}`);
	}
}
