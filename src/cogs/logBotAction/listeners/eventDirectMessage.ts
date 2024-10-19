import { Listener, container } from '@sapphire/framework';
import { DirectMessage } from '../../../lib/events/index.js';
import { getChannelAndEmbed } from '../utils.js';
import { EmbedBuilder } from 'discord.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';
import { User } from '../../../lib/database/model.js';
import { Sequential } from '../../../lib/utils.js';

export class logBotActionDirectMessageListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'logBotActionDirectMessage',
            emitter: container.events,
            event: CUSTOM_EVENTS.DirectMessage
        });
    }

    @Sequential
    async run(e: DirectMessage) {
        const dbUser = await User.findOne({ where: { key: e.discordMessage.author.id } })
        const embed = new EmbedBuilder()
            .setColor(0xffff00)
            .setAuthor({ name: 'DM from user' })
            .setDescription(e.discordMessage.content)
            .setThumbnail(dbUser ? dbUser.avatarURL : null)
            .setTimestamp();

        if (dbUser) {
            embed.addFields({ name: 'Account name', value: dbUser.username, inline: true }, { name: 'Nickname', value: dbUser.nickname, inline: true })
            embed.setFooter({ text: `User ID: ${dbUser.key}` });
        }

        await getChannelAndEmbed(embed);
    }
}
