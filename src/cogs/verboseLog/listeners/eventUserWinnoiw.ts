import { Listener, container } from '@sapphire/framework';
import { UserWinnow } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { time, TimestampStyles, userMention, EmbedBuilder } from 'discord.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class verboseLogUserWinnowListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'verboseLogUserWinnow',
            emitter: container.events,
            event: CUSTOM_EVENTS.UserWinnow
        });
    }
    async run(e: UserWinnow) {
        const relative = time(e.joinedDiscordAt, TimestampStyles.RelativeTime);
        const joinedEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setAuthor({ name: 'Member Joined', iconURL: e.dbUser.avatarURL })
            .setDescription(userMention(e.id))
            .setThumbnail(e.avatarURL)
            .addFields(
                { name: 'Account name', value: e.dbUser.username, inline: true },
                { name: 'Nickname', value: e.dbUser.nickname, inline: true },
                { name: 'Joined discord', value: relative, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `ID: ${e.id}` });

        await getChannelAndEmbed(joinedEmbed);
    }
}
