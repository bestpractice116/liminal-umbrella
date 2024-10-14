import { container } from '@sapphire/framework';
import { ChannelType, EmbedBuilder } from 'discord.js';

export function getChannelNames(): string[] {
    const channelNames: string[] = [];
    const logChannelName = process.env.LOG_CHANNEL;
    if (logChannelName) {
        channelNames.push(logChannelName);
    }
    const verboseLogChannelName = process.env.VERBOSE_LOG_CHANNEL;
    if (verboseLogChannelName) {
        channelNames.push(verboseLogChannelName);
    }
    return channelNames;
}

export async function getChannelAndSend(msg: string) {
    const channelNames = getChannelNames();
    for (const channelName of channelNames) {
        const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channelName);
        if (channel && channel.type == ChannelType.GuildText) {
            await channel.send(msg);
        } else {
            container.logger.warn('Cannot find the ${channel_name} channel, or not a text channel');
        }
    }
}

export async function getChannelAndEmbed(embed: EmbedBuilder) {
    const channelNames = getChannelNames();
    for (const channelName of channelNames) {
        const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channelName);
        if (channel && channel.type == ChannelType.GuildText) {
            return await channel.send({ embeds: [embed] });
        } else {
            container.logger.warn('Cannot find the ${channel_name} channel, or not a text channel');
        }
    }
    return null;
}
