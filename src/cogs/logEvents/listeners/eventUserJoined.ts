import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { time, TimestampStyles, userMention, EmbedBuilder } from 'discord.js';

export class LogEventsUserJoinedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    container.logger.info("logEvents cog - construct UserJoinedListener");
    super(context, {
      ...options,
      name: 'logEventsUserJoined',
      emitter: container.events,
      event: 'userJoined'
    });
  }
  run (e: UserJoined) {
    const relative = time(e.joinedDiscordAt, TimestampStyles.RelativeTime);
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setAuthor({ name: 'Member Joined', iconURL: e.avatarURL})
      .setDescription(userMention(e.id))
      .setThumbnail(e.avatarURL)
      .addFields(
        { name: 'Account name', value: e.username, inline: true },
        { name: 'Nickname', value: e.nickname, inline: true },
        { name: 'Joined discord', value: relative, inline: true },
        { name: 'Previous member', value: e.exMember ? 'Yes' : 'No', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${e.id}` });

    getChannelAndEmbed(this.container, exampleEmbed);
  }
}