import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';

export class LogEventsBotStartedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'logEventsBotStarted',
      emitter: container.events,
      event: 'botStarted'
    });
  }
  run (e: BotStarted) {
    container.logger.info("logEvents cog - botStarted arg ", e);
    getChannelAndSend(this.container, `RPGBot restarted`);
  }
}

