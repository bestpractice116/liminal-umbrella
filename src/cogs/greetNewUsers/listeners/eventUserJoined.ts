import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';
import { getMessage } from '../../../lib/message.js';

export class greetNewUsersUserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'greetNewUsersUserJoined',
      emitter: container.events,
      event: 'userJoined'
    });
  }

  @Sequential
  async run (e: UserJoined) {
    // Post welcome message for newly joined users
    const msg = await getMessage('NEW_USER_GREETING', {e})
    const id = await getChannelAndSend(this.container, msg)

    // Stash a reference to that message so that we can find it when reacted to etc later. (not currently used for anything)
    if (id) {
      await this.container.database.greetingMessageAdd(id, e.id);
    }
  }
}