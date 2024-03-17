import { Container } from "@sapphire/framework";
import { ChannelType } from 'discord.js';

export function getChannelAndSend(container: Container, msg: string) {
  const channel_name = process.env.LOG_EVENTS_CHANNEL;
  if (!channel_name) {
    return;
  }
  const client = container.client;
  const channel = client.channels.cache.find(channel => channel.type == ChannelType.GuildText && channel.name === channel_name);
  if (channel && channel.type == ChannelType.GuildText) {
    channel.send(msg);
  } else {
      container.logger.warn("Cannot find the ${channel_name} channel, or not a text channel");
  }
}