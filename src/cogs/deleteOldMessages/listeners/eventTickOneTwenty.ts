import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
import { getChannelName } from '../utils.js';
import { Sequential } from '../../../lib/utils.js';
import { Message } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';
import { ChannelType, DiscordAPIError, GuildTextBasedChannel } from 'discord.js';
import { shortSleep, sleepUpToTwoHours } from '../../../lib/utils.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

const messageAgeBeforeDeletes = 30 * 24 * 60 * 60 * 1000; // 30 days ago

export class deleteOldMessagesTickOneTwentyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'deleteOldMessagesTickOneTwenty',
            emitter: container.events,
            event: CUSTOM_EVENTS.TickOneTwenty
        });
    }

    @Sequential
    async findMessagesToDelete(discordChannel: GuildTextBasedChannel) {
        // Find all non-pinned messages > 30 days old from the channel.
        const since = Date.now() - messageAgeBeforeDeletes;
        return Message.findAll({
            where: {
                channelId: discordChannel.id,
                createdTimestamp: { [Op.lt]: since },
                pinned: false
            },
            order: [['createdTimestamp', 'ASC']]
        });
    }

    @Sequential
    async deleteMsg(discordChannel: GuildTextBasedChannel, msg: Message) {
        const channelName = getChannelName();
        this.container.logger.info(`Delete ${msg.type} type old message in ${channelName} - ${msg.id}: '${msg.content}'`);
        // TODO - log error if this fails
        const db = await this.container.database.getdb();
        await db.transaction(async () => {
            try {
                const discordMessage = await discordChannel.messages.fetch(msg.id);
                await discordMessage.delete();
            } catch (e: unknown) {
                if (e instanceof DiscordAPIError && e.code === 10008) {
                    // Discord message has already been deleted, skip
                } else {
                    throw e;
                }
            }
            await msg.destroy();
        });
    }

    async run(_e: TickFive) {
        const channelName = getChannelName();
        if (!channelName) return;

        await sleepUpToTwoHours();

        const discordChannel = await this.container.database.getdiscordChannel(this.container.guild!, channelName);
        if (discordChannel.type !== ChannelType.GuildText) {
            return;
        }

        const msgs = await this.findMessagesToDelete(discordChannel);

        await shortSleep();
        // Delete them from Discord and the bot's database.
        for (const msg of msgs) {
            await this.deleteMsg(discordChannel, msg);
            await shortSleep();
        }
    }
}
