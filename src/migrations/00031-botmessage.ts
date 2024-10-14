import type { MigrationParams } from 'umzug';
import { BotMessage } from '../lib/database/model.js';

export const up = async (_uz: MigrationParams<any>) => {
    await BotMessage.findOne({ where: { name: 'NEW_USER_GREETING' } }).then(async (message) => {
        if (!message) {
            return;
        }
        message.value =
            '<@${this.u.key}> Welcome to Preston RPG Community.  If you have read the rules and altered your name as asked then an Admin will be along shortly to give access to the rest of the server.';
        await message.save();
    });
};

export const down = async (_uz: MigrationParams<any>) => {};
