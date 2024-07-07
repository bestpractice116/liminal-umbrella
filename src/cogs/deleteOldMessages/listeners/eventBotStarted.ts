import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';
import { ChannelType } from 'discord.js';

export class deleteOldMessagesBotStartedListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'deleteOldMessagesBotStarted',
			emitter: container.events,
			event: 'botStarted'
		});
	}

	@Sequential
	async run(e: BotStarted) {
		container.logger.info('deleteOldMessages cog started');
		const channel_name = getChannelName();
		if (!channel_name) {
			container.logger.info('deleteOldMessages cog not running - no channel name set');
			return;
		}
		const discordChannel = await this.container.database.getdiscordChannel(e.guild, channel_name!);
		if (discordChannel!.type !== ChannelType.GuildText) {
			return;
		}
		await this.container.database.syncChannel(discordChannel);
	}
}
