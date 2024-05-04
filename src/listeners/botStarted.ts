import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../lib/events/index.js';
import { Message } from '../lib/database/model.js';
import {Sequential} from '../lib/utils.js';
import { sql } from '@sequelize/core';
import { ChannelType } from 'discord.js';

export class BotStartedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'eventsBotStarted',
      emitter: container.events,
      event: 'botStarted'
    });
  }
  @Sequential
  async getSome(): Promise<Message[]> {
    return await Message.findAll({
        where: {
            pinned: sql`null`,
        },
        limit: 10,
    });
  }

  @Sequential
  async updateMessage(id: string, val : boolean) {
    return Message.update(
        { pinned: val},
        {
            where: {
                id
            },
        },
    );
  }

  async run (e: BotStarted) {
    let messages = [];
    do {
        messages = await this.getSome();
        for (const msg of messages) {
            console.log('start discord fetch of message');
            const discordChannel = await e.guild.channels.fetch(msg.channelId);
            if (discordChannel!.type === ChannelType.GuildText) {
                const discordMessage = await discordChannel!.messages.fetch(msg.id);
                console.log('discord got message');
                await this.updateMessage(msg.id, discordMessage.pinned);
                console.log(`Updated pinned on message ${msg.id}`);
            }
            else {
                console.log(`message ${msg.id} not a text message`)
            }
        }
        console.log('updated 10 messages');
    } while (messages.length > 0);
    console.log("Finished updates to messages");
  }
}