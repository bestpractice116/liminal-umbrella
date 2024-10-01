import { ChannelType } from 'discord.js';
import { container } from '@sapphire/framework';
import { getMessage } from '../../lib/message.js';
import { User } from '../../lib/database/model.js';

export function getChannelName(): string | null {
	const channel_name = process.env.GREET_USERS_CHANNEL;
	if (!channel_name) {
		return null;
	}
	return channel_name;
}

export async function getChannelAndSend(msg: string): Promise<void | string> {
	const channel_name = getChannelName();

	const client = container.client;
	const channel = client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channel_name);
	if (channel && channel.type == ChannelType.GuildText) {
		const message = await channel.send(msg);
		return message.id;
	} else {
		container.logger.warn('Cannot find the ${channel_name} channel, or not a text channel');
	}
}

export async function doUserGreeting(u: User) {
	const db = await container.database.getdb();
	await db.transaction(async () => {
		// Post welcome message for newly joined users
		const msg = await getMessage('NEW_USER_GREETING', { u });
		const id = await getChannelAndSend(msg);

		// Stash a reference to that message so that we can find it when reacted to etc later.
		if (id) {
			await container.database.greetingMessageAdd(id, u.key);
		}
	});
}
