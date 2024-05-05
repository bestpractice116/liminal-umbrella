import { Listener, container } from '@sapphire/framework';
import { UserLeft } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { userMention, EmbedBuilder } from 'discord.js';

export class LogEventsUserLeftListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'logEventsUserLeft',
      emitter: container.events,
      event: 'userLeft'
    });
  }
  run (e: UserLeft) {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setAuthor({ name: 'Member Left', iconURL: e.avatarURL})
      .setDescription(userMention(e.id))
      .setThumbnail(e.avatarURL)
      .addFields(
        { name: 'Account name', value: e.username, inline: true },
        { name: 'Nickname', value: e.nickname, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${e.id}` });

    getChannelAndEmbed(this.container, exampleEmbed);
  }
}