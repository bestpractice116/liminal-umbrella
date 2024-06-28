import { Listener, container } from '@sapphire/framework';
import { BotMessageCacheClear } from '../lib/events/index.js';
import { clearMessageCache } from '../lib/message.js';

export class eventBotMessageMessageCacheClearListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'eventBotMessageCacheClear',
      emitter: container.events,
      event: 'botMessageCacheClear'
    });
  }
  run (_: BotMessageCacheClear) {
    clearMessageCache();
  }
}
