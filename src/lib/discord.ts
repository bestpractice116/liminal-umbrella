import { Snowflake, TextChannel, ChannelType, userMention, ForumChannel, AnyThreadChannel } from 'discord.js';
import { container } from '@sapphire/framework';
import { gametypes } from 'common/schema';
import { PlannedGame, GameSession } from './database/model.js';

export function gameChannelLink(channelId: Snowflake): string {
	return `https://discord.com/channels/${container.guildId}/${channelId}`;
}

export function getTextChannel(name: string): TextChannel | undefined {
	const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === name);
	if (channel && channel.type == ChannelType.GuildText) {
		return channel;
	}
	return undefined;
}

export function getGameListingChannel(): TextChannel | undefined {
	const channel_name = 'game_listings';
	return getTextChannel(channel_name);
}

export function getOneShotsChannel(): ForumChannel | undefined {
	const channel_name = 'one_shots';
	const channel = container.client.channels.cache.find((channel) => channel.type == ChannelType.GuildForum && channel.name === channel_name);
	if (channel && channel.type == ChannelType.GuildForum) {
		return channel;
	}
	return undefined;
}

export async function getOneShotThread(id: string): Promise<AnyThreadChannel | null> {
	const channel = await getOneShotsChannel();
	if (!channel) return null;
	try {
		return await channel.threads.fetch(id);
	} catch (e: any) {
		if (e.code === 10003) {
			// 'Unknown Channel' - thread has already been deleted, skip
			return null;
		} else {
			throw e;
		}
	}
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
		const taken = game.maxplayers - (await game.countSignedupUsers());
		out.push(`Spaces currently available: ${taken}/${game.maxplayers}`);
	}
	out.push(`DM Contact: ${userMention(game.owner)}`);
	out.push(`Brief description: ${game.description}`);
	return out.join('\n');
}
