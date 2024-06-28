import type { MigrationParams } from 'umzug';
import { BotMessage } from '../lib/database/model.js';

export const up = async (_uz: MigrationParams<any>) => {
    await BotMessage.findOne({ where: { name: 'NEW_USER_GREETING' } }).then((message) => {
        if (!message) {
            return
        }
        message.value = '<@${this.e.id}> Welcome to Preston RPG Community.  If you have read the rules and altered your name as asked then an Admin will be along shortly to give access to the rest of the server.'
        message.save();
    });
};

export const down = async (_uz: MigrationParams<any>) => {

};
