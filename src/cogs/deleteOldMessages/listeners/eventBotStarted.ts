import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';

export class LogEventsTickFiveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'deleteOldMessagesBotStarted',
      emitter: container.events,
      event: 'botStarted'
    });
  }
  async run (e: BotStarted) {
    container.logger.info("deleteOldMessages cog - BotStarted arg ", e);
    const discordChannel = await this.container.database.getdiscordChannel(e.guild, "location_booking");
    await this.container.database.syncChannel(discordChannel)
    //getChannelAndSend(this.container, `deleteOldMessages - Tick: ${e.firedAt}`)
  }
}
