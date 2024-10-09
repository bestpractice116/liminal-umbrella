import { Listener, Events } from '@sapphire/framework';
import { GuildMember } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildMemberRemoveEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.GuildMemberRemove
        });
    }

    @Sequential
    public override run(guildMember: GuildMember) {
        return this.container.database.guildMemberRemove(guildMember.id);
    }
}
