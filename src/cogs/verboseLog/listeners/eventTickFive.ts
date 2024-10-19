import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import dayjs from 'common';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class verboseLogTickFiveListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'verboseLogTickFive',
            emitter: container.events,
            event: CUSTOM_EVENTS.TickFive
        });
    }
    async run(e: TickFive) {
        const thing = dayjs(new Date(e.firedAt));
        //container.logger.info("verboseLog cog - tickFive");
        await getChannelAndSend(`Tick (5m): ${thing.format('LT')}`);
    }
}
