import { Listener, container } from '@sapphire/framework';
import { TickOneTwenty } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import dayjs from 'common';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class verboseLogTickOneTwentyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'verboseLogTickOneTwenty',
            emitter: container.events,
            event: CUSTOM_EVENTS.TickOneTwenty
        });
    }
    async run(e: TickOneTwenty) {
        const thing = dayjs(new Date(e.firedAt));
        container.logger.info(`verboseLog cog - tickOneTwenty at ${thing.format('LT')}`);
        await getChannelAndSend(`Tick (2 hours): ${thing.format('LT')}`);
    }
}
