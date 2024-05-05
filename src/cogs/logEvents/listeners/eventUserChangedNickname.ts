import { Listener, container } from '@sapphire/framework';
import { UserChangedNickname } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { userMention, EmbedBuilder } from 'discord.js';

export class LogEventsUserChangedNicknameListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'logEventsUserChangedNickname',
      emitter: container.events,
      event: 'userChangedNickname'
    });
  }
  run (e: UserChangedNickname) {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0000FF)
      .setAuthor({ name: 'Member Changed Nickname', iconURL: e.dbUser.avatarURL})
      .setDescription(userMention(e.id))
      .setThumbnail(e.dbUser.avatarURL)
      .addFields(
        { name: 'Account name', value: e.dbUser.username, inline: true },
        { name: 'New Nickname', value: e.newNickname, inline: true },
        { name: 'Old Nickname', value: e.oldNickname, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${e.id}` });

    getChannelAndEmbed(this.container, exampleEmbed);
  }
}