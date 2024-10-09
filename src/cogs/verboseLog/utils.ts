import { container } from '@sapphire/framework';
import { ChannelType, EmbedBuilder } from 'discord.js';

export function channelName(): string | null {
    return process.env.VERBOSE_LOG_CHANNEL ?? null;
}

export async function getChannelAndSend(msg: string) {
    const name = channelName();
    if (!name) {
        return;
    }
    const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === name);
    if (channel && channel.type == ChannelType.GuildText) {
        await channel.send(msg);
    } else {
        container.logger.warn('Cannot find the ${channel_name} channel, or not a text channel');
    }
}

export async function getChannelAndEmbed(embed: EmbedBuilder) {
    const cName = channelName();
    if (!cName) {
        return;
    }
    const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === cName);
    if (channel && channel.type == ChannelType.GuildText) {
        await channel.send({ embeds: [embed] });
    } else {
        container.logger.warn('Cannot find the ${channel_name} channel, or not a text channel');
    }
}
