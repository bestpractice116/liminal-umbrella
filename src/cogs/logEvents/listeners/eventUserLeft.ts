import { Listener, container } from '@sapphire/framework';
import { UserLeft } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';

export class LogEventsUserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'logEventsUserLeft',
      emitter: container.events,
      event: 'userLeft'
    });
  }
  run (e: UserLeft) {
    container.logger.info("logEvents cog - userLeft arg ", e);
    getChannelAndSend(this.container, `User left the server - id: ${e.id} username: ${e.name} server nickname: ${e.nickname}`)
  }
}