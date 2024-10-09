import { Listener, Events } from '@sapphire/framework';
import { Message } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class MessageUpdateEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.MessageUpdate
        });
    }

    @Sequential
    public override run(_: Message, newMessage: Message) {
        if (!newMessage.guildId) {
            return;
        }
        this.container.database.indexMessage(newMessage);
        return;
    }
}
