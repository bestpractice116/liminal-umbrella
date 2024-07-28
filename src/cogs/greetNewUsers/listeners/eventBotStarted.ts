import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';
import { CustomEvents } from '../../../lib/events.js';
import { getTextChannel } from '../../../lib/discord.js';

export class greetNewUsersBotStartedListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'greetNewUsersBotStarted',
			emitter: container.events,
			event: CustomEvents.BotStarted
		});
	}

	@Sequential
	async run(_e: BotStarted) {
		const channelName = getChannelName();
		if (!channelName) return;
		const channel = await getTextChannel(channelName!);
		if (!channel) return;
		await this.container.database.syncChannel(channel);
	}
}
