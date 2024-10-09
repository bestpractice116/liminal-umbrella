import { Guild } from 'discord.js';

export class BotStarted {
    constructor(public guild: Guild) {}
}
