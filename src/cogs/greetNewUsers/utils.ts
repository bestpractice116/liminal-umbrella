import { ChannelType, Message } from 'discord.js';
import { container } from '@sapphire/framework';
import { getMessage } from '../../lib/message.js';
import { User } from '../../lib/database/model.js';

export function getChannelName(): string | null {
    const channelName = process.env.GREET_USERS_CHANNEL;
    if (!channelName) {
        return null;
    }
    return channelName;
}

export async function getChannelAndSend(msg: string): Promise<null | Message> {
    const channelName = getChannelName();
    const client = container.client;
    const channel = client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channelName);
    if (channel && channel.type == ChannelType.GuildText) {
        return channel.send(msg);
    } else {
        container.logger.warn('Cannot find the ${channel_name} channel, or not a text channel');
    }
    return null;
}

export async function doUserGreeting(u: User) {
    const db = await container.database.getdb();
    await db.transaction(async () => {
        // Post welcome message for newly joined users
        const msg = await getMessage('NEW_USER_GREETING', { u });
        const greetingMessage = await getChannelAndSend(msg);

        // Stash a reference to that message so that we can find it when reacted to etc later.
        if (greetingMessage) {
            await container.database.greetingMessageAdd(greetingMessage, u);
        }
    });
}
