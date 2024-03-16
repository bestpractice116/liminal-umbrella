import { Listener } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

export class GuildMemberRemoveEvent extends Listener {
	public override run(guildMember : GuildMember) {
		return this.container.database.guildMemberRemove(guildMember.id);
	}
}
