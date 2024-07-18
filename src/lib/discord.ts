import { Snowflake, TextChannel, ChannelType, userMention, ForumChannel } from 'discord.js';
import { container } from '@sapphire/framework';
import { gametypes } from 'common/schema';
import { PlannedGame, GameSession } from './database/model.js';

export function gameChannelLink(channelId: Snowflake): string {
	return `https://discord.com/channels/${container.guildId}/${channelId}`;
}

export function getGameListingChannel(): TextChannel | undefined {
	const channel_name = 'game_listings';
	const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channel_name);
	if (channel && channel.type == ChannelType.GuildText) {
		return channel;
	}
	return undefined;
}

export function getOneShotsChannel(): ForumChannel | undefined {
	const channel_name = 'one_shots';
	const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channel_name);
	if (channel && channel.type == ChannelType.GuildForum) {
		return channel;
	}
	return undefined;
}

export async function format(game: PlannedGame | GameSession): Promise<string> {
	const gs = await game.getGamesystemOb();
	const out = [`Advanture Name: ${game.name}`, `Type: ${gametypes[game.type!]}`];
	if (game.gamesystem) {
		out.push(`Game system: ${gs!.description}`);
	}
	if (game.starttime) {
		const formatter = new Intl.DateTimeFormat('en-UK', { weekday: 'short', month: 'short', day: 'numeric' });
		const d = new Date(game.starttime);
		const startTime = game.starttime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		const endTime = game.endtime!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		out.push(`Date, day and time of play: ${formatter.format(d)} ${startTime}-${endTime}`);
	}
	if (game.location) {
		out.push(`Location: ${game.location}`);
	}
	if (game.maxplayers) {
		out.push(`Spaces currently available: ${game.maxplayers}/${game.maxplayers}`);
	}
	out.push(`DM Contact: ${userMention(game.owner)}`);
	out.push(`Brief description: ${game.description}`);
	return out.join('\n');
}
