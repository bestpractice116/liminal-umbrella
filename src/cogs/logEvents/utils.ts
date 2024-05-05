import { Container } from "@sapphire/framework";
import { ChannelType, EmbedBuilder } from 'discord.js';

export function channelName() : string | null {
  const channel_name = process.env.LOG_EVENTS_CHANNEL;
  if (!channel_name) {
    return null;
  }
  return channel_name;
}

export function getChannelAndSend(container: Container, msg: string) {
  const channel_name = channelName();
  if (!channel_name) {
    return;
  }
  const channel = container.client.channels.cache.find(channel => channel.type == ChannelType.GuildText && channel.name === channel_name);
  if (channel && channel.type == ChannelType.GuildText) {
    channel.send(msg);
  } else {
      container.logger.warn("Cannot find the ${channel_name} channel, or not a text channel");
  }
}

export function getChannelAndEmbed(container: Container, embed: EmbedBuilder) {
  const channel_name = channelName();
  if (!channel_name) {
    return;
  }
  const channel = container.client.channels.cache.find(channel => channel.type == ChannelType.GuildText && channel.name === channel_name);
  if (channel && channel.type == ChannelType.GuildText) {
    channel.send({embeds: [embed]});
  } else {
      container.logger.warn("Cannot find the ${channel_name} channel, or not a text channel");
  }
}