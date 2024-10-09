import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { Sequential } from '../../../lib/utils.js';
import { User, Role } from '../../../lib/database/model.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class addAllUsersRoleBotStartedListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'addAllUsersRoleBotStarted',
			emitter: container.events,
			event: CUSTOM_EVENTS.BotStarted
		});
	}

	@Sequential
	async run(e: BotStarted) {
		for (const user of await User.findAll({
			where: { bot: false, left: false },
			include: ['roles']
		})) {
			const roles = (await user.roles) || [];
			if (!roles.find((role) => role.name == 'AllUsers')) {
				container.logger.info(`Pre-existing user ${user.nickname} is missing 'AllUsers' Role - adding it.`);
				const dbRole = await Role.findOne({ where: { name: 'AllUsers' } });
				if (!dbRole) {
					container.logger.error(`Cannot find 'AllUsers' role`);
					return;
				}
				const role = await e.guild.roles.resolve(dbRole.key);
				const discordUser = await e.guild.members.fetch(user.key);
				await discordUser.roles.add(role!);
			}
		}
	}
}
