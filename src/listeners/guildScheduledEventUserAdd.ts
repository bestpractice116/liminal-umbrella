import { Listener } from '@sapphire/framework';
import { GuildScheduledEvent, User } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildScheduledEventUserAddEvent extends Listener {
	@Sequential
	public override run(_guildScheduledEvent: GuildScheduledEvent, _user: User) {
		console.log(`Add User to event ${_guildScheduledEvent.id} user ${_user.id}`);
	}
}
