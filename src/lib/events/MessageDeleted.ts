import { Message as DiscordMessage } from "discord.js";
import { Message } from '../database/model.js';

export class MessageDeleted {
    constructor(
        public discordMessage: DiscordMessage,
        public dbMessage: Message,
    ) {}
  }