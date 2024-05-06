import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
//import { getChannelAndSend } from '../utils.js';

export class verboseLogTickFiveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'verboseLogTickFive',
      emitter: container.events,
      event: 'tickFive'
    });
  }
  run (_: TickFive) {
    container.logger.info("verboseLog cog - tickFive");
    //getChannelAndSend(this.container, `Tick: ${e.firedAt}`)
  }
}
