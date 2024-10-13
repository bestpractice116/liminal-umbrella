import { Message as DiscordMessage } from 'discord.js';

export class DirectMessage {
    constructor(
        public discordMessage: DiscordMessage,
    ) {}
}