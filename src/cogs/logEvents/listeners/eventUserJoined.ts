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
    const icon = e.discordUser.user.avatarURL() || e.discordUser.user.defaultAvatarURL;
    const relative = time(e.discordUser.user.createdAt, TimestampStyles.RelativeTime);
    const exampleEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setAuthor({ name: 'Member Joined', iconURL: icon})
      .setDescription(userMention(e.discordUser.id))
      .setThumbnail(icon)
      .addFields(
        { name: 'Account name', value: e.discordUser.user.username, inline: true },
        { name: 'Nickname', value: e.dbUser.nickname, inline: true },
        { name: 'Joined discord', value: relative, inline: true },
        { name: 'Previous member', value: e.exMember ? 'Yes' : 'No', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `ID: ${e.discordUser.id}` });

    getChannelAndEmbed(this.container, exampleEmbed);
  }
}