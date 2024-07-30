import { Listener, Events } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildMemberAddEvent extends Listener {
	constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.GuildMemberAdd
		});
	}

	@Sequential
	public override run(guildMember: GuildMember) {
		return this.container.database.guildMemberAdd(guildMember);
	}
}
