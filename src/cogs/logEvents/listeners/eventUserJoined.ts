import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';

export class LogEventsUserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    container.logger.info("logEvents cog - construct UserJoinedListener");
    super(context, {
      ...options,
      name: 'logEventsUserJoined',
      emitter: container.events,
      event: 'userJoined'
    });
  }
  run (e: UserJoined) {
    container.logger.info("logEvents cog - userJoined arg ", e);
    getChannelAndSend(this.container, `New user joined the server - id: ${e.id} username: ${e.name} server nickname: ${e.nickname}`)
  }
}