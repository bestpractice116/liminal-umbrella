import { container } from '@sapphire/framework';
import { ChannelType, EmbedBuilder } from 'discord.js';

export function getChannelNames(): string[] {
    const channel_names: string[] = [];
    const log_channel_name = process.env.LOG_CHANNEL;
    if (log_channel_name) {
        channel_names.push(log_channel_name);
    }
    const verbose_log_channel_name = process.env.VERBOSE_LOG_CHANNEL;
    if (verbose_log_channel_name) {
        channel_names.push(verbose_log_channel_name);
    }
    return channel_names;
}

export async function getChannelAndSend(msg: string) {
    const channel_names = getChannelNames();
    for (const channel_name of channel_names) {
        const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channel_name);
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
