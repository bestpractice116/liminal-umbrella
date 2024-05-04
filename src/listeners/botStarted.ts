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

  async run (_: BotStarted) {
    this.container.ticker.start();

    /*
    // Example - how to do a slow data migration piecewise without stopping the bot...
    // See also migrations 00002 and 00003
    let count = 0;
    let messages = [];
    console.log('Starting migrations to messages to have pinned flag');
    do {
        messages = await this.getSome();
        for (const msg of messages) {
            console.log('start discord fetch of message');
            const discordChannel = await e.guild.channels.fetch(msg.channelId);
            if (discordChannel!.type === ChannelType.GuildText) {
              try {
                const discordMessage = await discordChannel!.messages.fetch(msg.id);
                await this.updateMessage(msg.id, discordMessage.pinned);
                console.log(`Updated pinned on message ${msg.id}`);
              } catch (e : any) {
                if (e.code === 10008) {
                  console.log('Deleted message which is gone from discord');
                  await msg.destroy();
                } else {
                  throw e;
                }
              }
            }
            else {
                console.log(`message ${msg.id} not a text message`)
            }
            count++;
        }
    } while (messages.length > 0);
    console.log(`Finished updates to ${count} messages`);
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