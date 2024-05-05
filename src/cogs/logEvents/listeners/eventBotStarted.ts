import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import { time, TimestampStyles } from 'discord.js';

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
    const t = time(Date.now(), TimestampStyles.ShortTime);
    getChannelAndSend(this.container, `RPGBot restarted at ${t}`);
  }
}

