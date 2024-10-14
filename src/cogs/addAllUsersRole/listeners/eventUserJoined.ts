import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { Sequential } from '../../../lib/utils.js';
import { Role } from '../../../lib/database/model.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';
import { getGuildMemberById } from '../../../lib/discord.js';

export class addAllUsersRoleUserJoinedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'addAllUsersRoleUserJoined',
            emitter: container.events,
            event: CUSTOM_EVENTS.UserJoined
        });
    }

    @Sequential
    async run(e: UserJoined) {
        const discordUser = await getGuildMemberById(e.id);
        if (!discordUser) {
            container.logger.error(`Cannot find discord user ${e.id}`);
            return;
        }
        // If the user already has AllUsers, do nothing
        if (Array.from(discordUser.roles.cache.keys()).find((name) => name === 'AllUsers')) {
            return;
        }

        // Find the AllUsers role from Discord
        const dbRole = await Role.findOne({ where: { name: 'AllUsers' } });
        if (!dbRole) {
            container.logger.error(`Cannot find 'AllUsers' role`);
            return;
        }
        const role = discordUser.guild.roles.resolve(dbRole.key);

        // Add the role to the user who just joined.
        await discordUser.roles.add(role!);
        container.logger.debug(`Added AllUsers role to discord user ${discordUser.id} in eventUserJoined`);
    }
}
