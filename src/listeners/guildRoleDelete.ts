import { Listener, Events } from '@sapphire/framework';
import { Role } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class ChannelCreateEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.GuildRoleDelete
        });
    }

    @Sequential
    public override run(role: Role) {
        return this.container.database.roleDelete(role);
    }
}
