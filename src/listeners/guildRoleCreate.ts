import { Listener, Events } from '@sapphire/framework';
import { Role } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class GuildRoleCreateEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.GuildRoleCreate
        });
    }

    @Sequential
    public override run(newRole: Role) {
        return this.container.database.roleCreate(newRole);
    }
}
