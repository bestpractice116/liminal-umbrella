import { Listener, container } from '@sapphire/framework';
import { TickOneTwenty } from '../lib/events/index.js';
import { Sequential } from '../lib/utils.js';
import { CustomEvents } from '../lib/events.js';

export class TickOneTwentyEvent extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'eventTickOneTwenty',
            emitter: container.events,
            event: CustomEvents.TickOneTwenty
        });
    }

    @Sequential
    run(e: TickOneTwenty) {
        return container.database.sync(e.guild);
    }
}
