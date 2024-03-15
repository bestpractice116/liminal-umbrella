import { Listener, container } from '@sapphire/framework';
import {UserJoined} from '../lib/events/UserJoined.js';

export class UserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: container.events,
      event: 'userJoined'
    });
  }
  run (e: UserJoined) {
    container.logger.info("FOO EVENT arg ", e);
  }
}