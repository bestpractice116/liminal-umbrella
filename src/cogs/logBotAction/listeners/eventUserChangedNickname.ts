import { Listener, container } from '@sapphire/framework';
import { UserChangedNickname } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { userMention, EmbedBuilder } from 'discord.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class logBotActionUserChangedNicknameListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'logBotActionUserChangedNickname',
			emitter: container.events,
			event: CUSTOM_EVENTS.UserChangedNickname
		});
	}
	async run(e: UserChangedNickname) {
		// Log change (with old and new nickname in bot_log)
		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0000ff)
			.setAuthor({ name: 'Member Changed Nickname', iconURL: e.dbUser.avatarURL })
			.setDescription(`${userMention(e.id)} (${e.dbUser.username})`)
			.setThumbnail(e.dbUser.avatarURL)
			.addFields({ name: 'New Nickname', value: e.newNickname, inline: true }, { name: 'Old Nickname', value: e.oldNickname, inline: true })
			.setTimestamp()
			.setFooter({ text: `ID: ${e.id}` });

		await getChannelAndEmbed(exampleEmbed);
	}
}
