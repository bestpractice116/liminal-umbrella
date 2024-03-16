import { Listener, container } from '@sapphire/framework';
import { UserLeft } from '../../../lib/events/index.js';

export class UserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: container.events,
      event: 'userLeft'
    });
  }
  run (e: UserLeft) {
    container.logger.info("logEvents cog - userLeft arg ", e);
  }
}