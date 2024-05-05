import { Container } from "@sapphire/framework";
import { ChannelType, EmbedBuilder } from 'discord.js';

export function channelName() : string | null {
  const channel_name = process.env.ADMIN_CHAT_CHANNEL;
  if (!channel_name) {
    return null;
  }
  return channel_name;
}

export async function getChannelAndEmbed(container: Container, embed: EmbedBuilder) {
  const channel_name = channelName();
  if (!channel_name) {
    console.log("NO ADMIN CHAT CHANNEL");
    return;
  }
  const channel = container.client.channels.cache.find(channel => channel.type == ChannelType.GuildText && channel.name === channel_name);
  if (channel && channel.type == ChannelType.GuildText) {
    await channel.send({embeds: [embed]});
  } else {
      container.logger.warn("Cannot find the ${channel_name} channel, or not a text channel");
  }
}