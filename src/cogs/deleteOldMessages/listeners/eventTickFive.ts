import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import {Sequential} from '../../../lib/utils.js';
import { Message } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';

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
    const discordChannel = await this.container.database.getdiscordChannel(e.guild, channel_name!);
    const since = Date.now() - 1 * 7 * 24 * 60 * 60 * 1000; // 1 week ago
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
