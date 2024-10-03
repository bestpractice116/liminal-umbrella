import { Listener, container } from '@sapphire/framework';
import { UserLeft } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import { CustomEvents } from '../../../lib/events.js';
import { getTextChannel } from '../../../lib/discord.js';

export class greetNewUsersUserLeftistener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'greetNewUsersUserLeft',
			emitter: container.events,
			event: CustomEvents.UserLeft
		});
	}

	async run(e: UserLeft) {
		if (!e.greetingMessageId) return;

		const greetingChannelName = getChannelName();
		if (!greetingChannelName) return;
		const greetingChannel = await getTextChannel(greetingChannelName);
		if (!greetingChannel) return;
		const msg = await greetingChannel.messages.fetch(e.greetingMessageId);
		if (!msg) return;
		let reactions = 0;
		const greenTick = msg.reactions.resolve('✅');
		if (greenTick) reactions += greenTick.count;
		const redX = msg.reactions.resolve('❌');
		if (redX) reactions += redX.count;
		if (reactions === 0) {
			await msg.react('👋');
		}
	}
}
