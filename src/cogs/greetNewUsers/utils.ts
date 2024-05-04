import { Container } from "@sapphire/framework";
import { ChannelType } from 'discord.js';

export function getChannelName() : string | null {
  const channel_name = process.env.GREET_USERS_CHANNEL;
  if (!channel_name) {
    return null;
  }
  return channel_name;
}

export async function getChannelAndSend(container: Container, msg: string) : Promise<void | string> {
  const channel_name = getChannelName();

  const client = container.client;
  const channel = client.channels.cache.find(channel => channel.type == ChannelType.GuildText && channel.name === channel_name);
  if (channel && channel.type == ChannelType.GuildText) {
    const message = await channel.send(msg);
    return message.id;
  } else {
      container.logger.warn("Cannot find the ${channel_name} channel, or not a text channel");
  }
}