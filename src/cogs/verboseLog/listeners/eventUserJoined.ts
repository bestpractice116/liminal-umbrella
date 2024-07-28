import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { time, TimestampStyles, userMention, EmbedBuilder } from 'discord.js';
import { CustomEvents } from '../../../lib/events.js';

export class verboseLogUserJoinedListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		container.logger.info('verboseLog cog - construct UserJoinedListener');
		super(context, {
			...options,
			name: 'verboseLogUserJoined',
			emitter: container.events,
			event: CustomEvents.UserJoined
		});
	}
	async run(e: UserJoined) {
		const relative = time(e.joinedDiscordAt, TimestampStyles.RelativeTime);
		const joinedEmbed = new EmbedBuilder()
			.setColor(0x00ff00)
			.setAuthor({ name: 'Member Joined', iconURL: e.avatarURL })
			.setDescription(userMention(e.id))
			.setThumbnail(e.avatarURL)
			.addFields(
				{ name: 'Account name', value: e.username, inline: true },
				{ name: 'Nickname', value: e.nickname, inline: true },
				{ name: 'Joined discord', value: relative, inline: true },
				{ name: 'Previous member', value: e.exMember ? 'Yes' : 'No', inline: true }
			)
			.setTimestamp()
			.setFooter({ text: `ID: ${e.id}` });

		await getChannelAndEmbed(joinedEmbed);
	}
}
