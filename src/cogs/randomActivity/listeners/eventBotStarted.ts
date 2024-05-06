import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { setRandomActivity } from '../activity.js';

export class randomActivityBotStartedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'randomActivityBotStarted',
      emitter: container.events,
      event: 'botStarted'
    });
  }

  run (_: BotStarted) {
    setRandomActivity();
  }
}

