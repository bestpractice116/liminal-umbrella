import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';

export class GreetNewUsersUserJoinedListener extends Listener {
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
    const id = await getChannelAndSend(this.container, `<@${e.id}> Welcome to Preston RPG Community.  If you have read the rules and altered your name as asked then an Admin will be along shortly to give access to the rest of the server.`);

    // Stash a reference to that message so that we can find it when reacted to etc later. (not currently used for anything)
    if (id) {
      await this.container.database.greetingMessageAdd(id, e.id);
    }
  }
}