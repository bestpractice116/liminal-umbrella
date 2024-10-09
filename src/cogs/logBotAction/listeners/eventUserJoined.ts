import { Listener, container } from '@sapphire/framework';
import { UserJoined } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { userMention, EmbedBuilder } from 'discord.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class logBotActionUserJoinedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'logBotActionUserJoined',
            emitter: container.events,
            event: CUSTOM_EVENTS.UserJoined
        });
    }
    async run(e: UserJoined) {
        // Log user joined
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setAuthor({ name: 'Member Joined', iconURL: e.avatarURL })
            .setDescription(userMention(e.id))
            .setThumbnail(e.avatarURL)
            .addFields(
                { name: 'Account name', value: e.username, inline: true },
                { name: 'Nickname', value: e.nickname, inline: true },
                { name: 'Previous Member', value: e.exMember ? 'Yes' : 'No', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `ID: ${e.id}` });

        await getChannelAndEmbed(exampleEmbed);
    }
}
