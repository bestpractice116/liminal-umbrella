import type { MigrationParams } from 'umzug';
import { Channel, GreetingMessage, Message, User } from '../lib/database/model.js';
import { Op } from '@sequelize/core';

export const up = async (_uz: MigrationParams<any>) => {
    const channelName = process.env.GREET_USERS_CHANNEL;
    if (!channelName) throw new Error('GREET_USERS_CHANNEL environment variable not set');
    const channel = await Channel.findOne({ where: { name: channelName } });
    const messages = await Message.findAll({ where: { channelId: channel!.id } });
    for (const message of messages) {
        const match = /<@(\d+)>/.exec(message.content);
        if (match) {
            const userId = match[1];
            const greetingMessage = await GreetingMessage.findOne({ where: { userId } });
            if (!greetingMessage) {
                const user = await User.findOne({ where: { key: userId } });
                if (!user) continue;
                await GreetingMessage.create({ userId, messageId: message.id });
                console.log(`Associated greeting message for user ${userId}`);
            }
        }
    }
    const stillMissing = await User.findAll({
        include: ['greetingMessage'],
        where: {
            left: false,
            bot: false,
            '$greetingMessage.userId$': { [Op.eq]: null }
        }
    });
    console.log(`Still missing greeting messages for ${stillMissing.length} users`);
    for (const user of stillMissing) {
        console.log(`Still missing greeting message for user ${user.nickname} ID ${user.key}`);
    }
};

export const down = async (_uz: MigrationParams<any>) => {};
