import { Listener } from '@sapphire/framework';
import { Events, type ListenerErrorPayload } from '@sapphire/framework';
import { getChannelAndSend } from '../utils.js';

export class verboseLogListenerErrorListener extends Listener<typeof Events.ListenerError> {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'verboseLogListenerError',
            event: Events.ListenerError
        });
    }

    public async run(error: unknown, context: ListenerErrorPayload) {
        const { name, event, location } = context.piece;
        await getChannelAndSend(
            `Encountered error on event listener "${name}" for event "${String(event)}" at path "${location.full}": ${String(error)}`
        );
    }
}
