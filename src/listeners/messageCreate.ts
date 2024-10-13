import { Listener, Events } from '@sapphire/framework';
import { Message } from 'discord.js';
import { Sequential } from '../lib/utils.js';
import { DirectMessage } from '../lib/events/index.js';

export class MessageCreateEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.MessageCreate
        });
    }

    @Sequential
    public override async run(message: Message) {
        if (!message.guildId) {
            this.container.events.emit('directMessage', new DirectMessage(message))
            return;
        }
        await this.container.database.indexMessage(message);
        return;
    }
}
