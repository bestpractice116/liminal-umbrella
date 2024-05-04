import { Listener } from '@sapphire/framework';
import { DMChannel, GuildChannel } from 'discord.js';
import type { NonThreadGuildBasedChannel } from 'discord.js';
import {Sequential} from '../lib/utils.js';

export class ChannelUpdateEvent extends Listener {
	@Sequential
	public override run(_ : DMChannel | GuildChannel, newChannel : DMChannel | GuildChannel) {
        if (newChannel instanceof GuildChannel) {
            console.log("RUNNING CHANNEL UPDATE");
		    return this.container.database.channelUpdate(<NonThreadGuildBasedChannel>newChannel);
        }
        return
	}
}