import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { doUserGreeting } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class greetNewUsersUserJoinedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'greetNewUsersUserJoined',
            emitter: container.events,
            event: CUSTOM_EVENTS.UserJoined
        });
    }

    @Sequential
    async run(e: UserJoined) {
        await doUserGreeting(e.dbUser);
    }
}
