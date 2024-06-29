import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';

export class greetNewUsersBotStartedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'greetNewUsersBotStarted',
      emitter: container.events,
      event: 'botStarted'
    });
  }

  @Sequential
  async run (e: BotStarted) {
    const channelName = getChannelName();
    if (!channelName) {
      return;
    }
    await this.container.database.syncChannelNewMembers(e.guild, channelName!);
  }
}

