import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { Sequential } from '../../../lib/utils.js';
import { Role } from '../../../lib/database/model.js';

export class AddAllUsersRoleUserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'addAllUsersRoleUserJoined',
      emitter: container.events,
      event: 'userJoined'
    });
  }

  @Sequential
  async run (e: UserJoined) {
    if (!!Array.from(e.discordUser.roles.cache.keys()).find(name => name === 'AllUsers')) {
      return;
    }
    const dbRole = await Role.findOne({where: { name: 'AllUsers' }});
    if (!dbRole) {
      container.logger.error(`Cannot find 'AllUsers' role`);
      return;
    }
    const role = await e.discordUser.guild.roles.resolve(dbRole.id);
    await e.discordUser.roles.add(role!);
    console.log('Added role to discord user in eventUserJoined');
  }
}