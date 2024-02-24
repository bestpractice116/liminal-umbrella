import { Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';

export class GuildCreateEvent extends Listener {

	public override run(guild: Guild) {
        console.log("Guild create " + guild.id);
    }
}