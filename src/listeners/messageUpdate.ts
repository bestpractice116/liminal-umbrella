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
    public override async run(_: Message, newMessage: Message) {
        if (!newMessage.guildId) {
            return;
        }
        const db = await this.container.database.getdb();
        await db.transaction(async (transaction) => {
            this.container.database.indexMessage(transaction, newMessage);
        });
        return;
    }
}
