import { Listener, container } from '@sapphire/framework';
import { UserChangedNickname } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';

export class LogEventsUserChangedNicknameListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'logEventsUserChangedNickname',
      emitter: container.events,
      event: 'userChangedNickname'
    });
  }
  run (e: UserChangedNickname) {
    container.logger.info("logEvents cog - userChangedNickname arg ", e);
    getChannelAndSend(this.container, `User changed nickname - id: ${e.id} old nickname: ${e.oldNickname} new nickname: ${e.newNickname}`)
  }
}