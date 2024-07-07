import { Listener } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildMemberUpdateEvent extends Listener {
	@Sequential
	public override run(_: GuildMember, newGuildMember: GuildMember) {
		return this.container.database.guildMemberUpdate(newGuildMember);
	}
}
