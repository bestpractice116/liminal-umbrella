import { Listener, Events } from '@sapphire/framework';
import { DMChannel, GuildChannel } from 'discord.js';
import type { NonThreadGuildBasedChannel } from 'discord.js';
import { Sequential } from '../lib/utils.js';

export class ChannelUpdateEvent extends Listener {
	constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.ChannelUpdate
		});
	}

	@Sequential
	public override run(_: DMChannel | GuildChannel, newChannel: DMChannel | GuildChannel) {
		if (newChannel instanceof GuildChannel) {
			return this.container.database.channelUpdate((newChannel as NonThreadGuildBasedChannel));
		}
		return;
	}
}
