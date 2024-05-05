import { Listener, container } from '@sapphire/framework';
import { UserLeft } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { time, TimestampStyles, userMention, EmbedBuilder } from 'discord.js';

export class LogEventsUserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'logEventsUserLeft',
      emitter: container.events,
      event: 'userLeft'
    });
  }
  run (e: UserLeft) {
    const icon = e.avatarURL;
    const relative = time(e.joinedDiscordAt, TimestampStyles.RelativeTime);
    const exampleEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setAuthor({ name: 'Member Joined', iconURL: icon})
      .setDescription(userMention(e.id))
      .setThumbnail(icon)
      .addFields(
        { name: 'Account name', value: e.username, inline: true },
        { name: 'Nickname', value: e.dbUser.nickname, inline: true },
        { name: 'Joined discord', value: relative, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${e.id}` });

    getChannelAndEmbed(this.container, exampleEmbed);
  }
}