import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelAndSend } from '../utils.js';
import { time, TimestampStyles } from 'discord.js';
import { CustomEvents } from '../../../lib/events.js';

export class verboseLogBotStartedListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'verboseLogBotStarted',
			emitter: container.events,
			event: CustomEvents.BotStarted
		});
	}
	async run(_: BotStarted) {
		container.logger.info('verboseLog cog - botStarted');
		const t = time(new Date(Date.now()), TimestampStyles.ShortTime);
		await getChannelAndSend(`RPGBot restarted at ${t}`);
	}
}
