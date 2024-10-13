import { Listener, Events } from '@sapphire/framework';
import { DMChannel, GuildChannel } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class ChannelDeleteEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: Events.ChannelDelete
        });
    }

    @Sequential
    public override run(channel: DMChannel | GuildChannel) {
        if (channel instanceof GuildChannel) {
            return this.container.database.channelDelete(channel);
        }
        return;
    }
}
