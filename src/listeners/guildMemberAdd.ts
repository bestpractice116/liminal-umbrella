import { Listener } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildMemberAddEvent extends Listener {
	@Sequential
	public override run(guildMember: GuildMember) {
		return this.container.database.guildMemberAdd(guildMember);
	}
}
