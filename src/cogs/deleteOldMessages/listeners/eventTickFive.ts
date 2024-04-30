import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
//import { getChannelAndSend } from '../utils.js';

export class LogEventsTickFiveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'deleteOldMessagesTickFive',
      emitter: container.events,
      event: 'tickFive'
    });
  }
  run (e: TickFive) {
    container.logger.info("deleteOldMessages cog - tickFive arg ", e);
    //getChannelAndSend(this.container, `deleteOldMessages - Tick: ${e.firedAt}`)
  }
}
