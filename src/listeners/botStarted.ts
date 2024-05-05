import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../lib/events/index.js';
/*import { Message } from '../lib/database/model.js';
import {Sequential} from '../lib/utils.js';
import { Op } from '@sequelize/core';
import { ChannelType } from 'discord.js';
*/

export class BotStartedListener extends Listener {
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
    let messages = [];
    container.logger.info('Starting migrations to messages to have pinned flag');
    do {
        messages = await this.getSome();
        for (const msg of messages) {
            container.logger.info('start discord fetch of message');
            const discordChannel = await e.guild.channels.fetch(msg.channelId);
            if (discordChannel!.type === ChannelType.GuildText) {
              try {
                const discordMessage = await discordChannel!.messages.fetch(msg.id);
                await this.updateMessage(msg.id, discordMessage.pinned);
                container.logger.info(`Updated pinned on message ${msg.id}`);
              } catch (e : any) {
                if (e.code === 10008) {
                  container.logger.info('Deleted message which is gone from discord');
                  await msg.destroy();
                } else {
                  throw e;
                }
              }
            }
            else {
                container.logger.info(`message ${msg.id} not a text message`)
            }
            count++;
        }
    } while (messages.length > 0);
    container.logger.info(`Finished updates to ${count} messages`);
    */
  }

  /*
  // Helper method to get a chunk of rows to work on
  @Sequential
  async getSome(): Promise<Message[]> {
    return await Message.findAll({
        where: {
            pinned: { [Op.is]: null }
        },
        limit: 10,
    });
  }

  // Helper method to update one single row
  @Sequential
  async updateMessage(id: string, val : boolean) {
    return Message.update(
        { pinned: val },
        {
            where: {
                id
            },
        },
    );
  }
  */
}
