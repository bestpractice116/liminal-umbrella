import { Listener, container } from '@sapphire/framework';
import { BotStarted } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';
import { CustomEvents } from '../../../lib/events.js';
import { getTextChannel } from '../../../lib/discord.js';
import { User } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';
import { getMessage } from '../../../lib/message.js';
import { ChannelType } from 'discord.js';

export class greetNewUsersBotStartedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'greetNewUsersBotStarted',
            emitter: container.events,
            event: CustomEvents.BotStarted
        });
    }

    @Sequential
    async run(_e: BotStarted) {
        const channelName = getChannelName();
        if (!channelName) return;
        const channel = await getTextChannel(channelName!);
        if (!channel) return;
        await this.container.database.syncChannel(channel);

        const db = await container.database.getdb();
        const stillMissing = await User.findAll({
            include: ['greetingMessage'],
            where: {
                left: false,
                bot: false,
                '$greetingMessage.userId$': { [Op.eq]: null }
            }
        });

        for (const u of stillMissing) {
            await db.transaction(async () => {
                // Post welcome message for newly joined users
                const msg = await getMessage('NEW_USER_GREETING', { u });
                const client = container.client;
                const channel = client.channels.cache.find((channel) => channel.type == ChannelType.GuildText && channel.name === channelName);
                if (channel && channel.type == ChannelType.GuildText) {
                    console.log('sending message');
                    const message = await channel.send('fill in legacy user greeting');
                    console.log('sent message, now edit message');
                    await message.edit(msg);
                    console.log('edited message');
                    console.log('greeting message add');
                    await container.database.greetingMessageAdd(message.id, u.key);
                    console.log('greeting message added');
                }
            });
        }
        console.log('END EVENT BOT STARTED')
    }
}
