import { Listener } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

export class GuildMemberAddEvent extends Listener {
	public override run(guildMember : GuildMember) {
		return this.container.database.guildMemberAdd(guildMember);
	}
}
