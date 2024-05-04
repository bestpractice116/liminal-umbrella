import { Listener } from '@sapphire/framework';
import { DMChannel, GuildChannel } from 'discord.js';
import type { NonThreadGuildBasedChannel } from 'discord.js';
import {Sequential} from '../lib/utils.js';

export class ChannelCreateEvent extends Listener {
  @Sequential
  public override run(newChannel : DMChannel | GuildChannel) {
    if (newChannel instanceof GuildChannel) {
        return this.container.database.channelCreate(<NonThreadGuildBasedChannel>newChannel);
    }
    return
  }
}