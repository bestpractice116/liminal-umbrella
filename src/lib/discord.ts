import { Snowflake } from 'discord.js';
import { container } from '@sapphire/framework';

export function gameChannelLink(channelId: Snowflake): string {
	return `https://discord.com/channels/${container.guildId}/${channelId}`;
}
