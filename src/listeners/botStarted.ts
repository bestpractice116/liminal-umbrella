import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../lib/events/index.js';
/*import { User } from '../lib/database/model.js';
import {Sequential} from '../lib/utils.js';
import { Op } from '@sequelize/core';*/


export class BotStartedEvent extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'eventsBotStarted',
      emitter: container.events,
      event: 'botStarted'
    });
  }

  async run (e: BotStarted) {
    this.container.ticker.start(e.guild);

    /*
    // Example - how to do a slow data migration piecewise without stopping the bot...
    // See also migrations 00002 and 00003
    let count = 0;
    let users = [];
    container.logger.info('Starting migrations to users to add data');
    do {
        users = await this.getSome();
        for (const user of users) {
            container.logger.info('start discord fetch of user');
            let discordUser = null;
            try {
              discordUser = await e.guild.members.fetch(user.key);
            } catch (e: any) {
              if (e.code === 10007) {
                await user.destroy();
              } else {
                throw e;
              }
            }
            if (discordUser) {
              const updates = {
                avatarURL: discordUser.user.avatarURL() || discordUser.user.defaultAvatarURL,
                username: discordUser.user.username,
                name: (discordUser.user.globalName || discordUser.user.username)!,
                joinedDiscordAt: discordUser.user.createdAt.valueOf(),
              }
              await this.updateUser(user.key, updates);
              container.logger.info(`Updated user ${user.key}`);
              count++;
            }
        }
    } while (users.length > 0);
    container.logger.info(`Finished updates to ${count} Users`);
    */
  }

  /*
  // Helper method to get a chunk of rows to work on
  @Sequential
  async getSome(): Promise<User[]> {
    return await User.findAll({
        where: {
          joinedDiscordAt: { [Op.is]: null },
        },
        limit: 10,
    });
  }

  // Helper method to update one single row
  @Sequential
  async updateUser(id: string, updates : any) {
    return User.update(
        updates,
        {
            where: {
               key: id 
            },
        },
    );
  }
  */
}
