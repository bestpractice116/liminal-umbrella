import { Listener, Events } from '@sapphire/framework';
import { Role } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class ChannelUpdateEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.GuildRoleUpdate
        });
    }

    @Sequential
    public override run(_: Role, role: Role) {
        return this.container.database.roleUpdate(role);
    }
}
