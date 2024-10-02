import { Listener, Events } from '@sapphire/framework';
import { Message } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class MessageCreateEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.MessageCreate
        });
    }

    @Sequential
    public override run(message: Message) {
        if (!message.guildId) {
            return;
        }
        console.log('messageCreate event index message', message.id);
        this.container.database.indexMessage(message);
        return;
    }
}
