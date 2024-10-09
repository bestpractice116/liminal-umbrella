import { Listener, Events } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildMemberUpdateEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.GuildMemberUpdate
        });
    }

    @Sequential
    public override run(_: GuildMember, newGuildMember: GuildMember) {
        return this.container.database.guildMemberUpdate(newGuildMember);
    }
}
