import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import {Sequential} from '../../../lib/utils.js';
import { Message } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';
import { ChannelType } from 'discord.js';

export class DeleteOldMessagesTickFiveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'deleteOldMessagesBotStarted',
      emitter: container.events,
      event: 'botStarted'
    });
  }

  @Sequential
  async run (e: BotStarted) {
    container.logger.info("deleteOldMessages cog - BotStarted arg ", e);
    const channel_name = getChannelName();
    if (!channel_name) {
      container.logger.info("NO CHANNEL NAME");
      return
    }
    const db = await this.container.database.getdb();
    const discordChannel = await this.container.database.getdiscordChannel(e.guild, channel_name!);
    if (discordChannel!.type !== ChannelType.GuildText) {
      return
    }
    container.logger.info("SYNC CHANNEL FOR DELETE OLD MESSAGES");
    await this.container.database.syncChannel(discordChannel)
    //getChannelAndSend(this.container, `deleteOldMessages - Tick: ${e.firedAt}`)
    const since = Date.now() - 1 * 24 * 60 * 60 * 1000; // 1 week ago
    container.logger.info("FIND OLD MESSAGES");
    const msgs = await Message.findAll({
      where: {
        channelId: discordChannel.id,
        createdTimestamp: { [Op.lt]: since },
        pinned: false,
      },
      order: [['createdTimestamp', 'ASC']],
    });
    for (const msg of msgs) {
      container.logger.info(`Found message to delete in ${channel_name} - ${msg.id}: ${msg.content}`);
      /*await db.transaction(async () => {
        const discordMessage = await discordChannel!.messages.fetch(msg.id);
        await discordMessage.delete();
        await msg.destroy();
      });*/
    }
  }
}
