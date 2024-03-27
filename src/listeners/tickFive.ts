import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../lib/events/index.js';
import {Sequential} from '../lib/utils.js';

export class TickFiveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'tickFive',
      emitter: container.events,
      event: 'tickFive'
    });
  }

  @Sequential
  run (e: TickFive) {
    container.logger.info("tickFive arg ", e);
    // FIXME - do sync for messages and check if we or discord dropped anything?
    return container.database.setHighestWatermark(e.firedAt);
  }
}