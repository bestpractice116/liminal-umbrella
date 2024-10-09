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
    public override async run(message: Message) {
        if (!message.guildId) {
            return;
        }
        const db = await this.container.database.getdb();
        await db.transaction(async (transaction) => {
            this.container.database.indexMessage(transaction, message);
        });
        return;
    }
}
