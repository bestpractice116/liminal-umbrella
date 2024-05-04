import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import {Sequential} from '../../../lib/utils.js';
import { Message } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';
import { ChannelType } from 'discord.js';

export class LogEventsTickFiveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'deleteOldMessagesTickFive',
      emitter: container.events,
      event: 'tickFive'
    });
  }

  @Sequential
  async run (e: TickFive) {
    const channel_name = getChannelName();
    if (!channel_name) {
      return
    }
    const db = await this.container.database.getdb();
    const discordChannel = await this.container.database.getdiscordChannel(e.guild, channel_name!);
    if (discordChannel!.type !== ChannelType.GuildText) {
      return
    }
    const since = Date.now() - 1 * 7 * 24 * 60 * 60 * 1000; // 1 week ago
    const msgs = await Message.findAll({
      where: {
        channelId: discordChannel.id,
        createdTimestamp: { [Op.lt]: since },
        pinned: false,
      },
      order: [['createdTimestamp', 'ASC']],
    });
    for (const msg of msgs) {
      container.logger.info(`Delete ${msg.type} type old message in ${channel_name} - ${msg.id}: '${msg.content}'`);
      await db.transaction(async () => {
        const discordMessage = await discordChannel!.messages.fetch(msg.id);
        await discordMessage.delete();
        await msg.destroy();
      });
    }
  }
}
