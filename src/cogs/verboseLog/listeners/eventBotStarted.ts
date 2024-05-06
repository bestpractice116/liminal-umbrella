import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import { time, TimestampStyles } from 'discord.js';

export class VerboseLogBotStartedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'verboseLogBotStarted',
      emitter: container.events,
      event: 'botStarted'
    });
  }
  async run (e: BotStarted) {
    container.logger.info("verboseLog cog - botStarted arg ", e);
    const t = time(new Date(Date.now()), TimestampStyles.ShortTime);
    await getChannelAndSend(this.container, `RPGBot restarted at ${t}`);
  }
}

