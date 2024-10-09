import { BotMessage } from './database/model.js';
import { container } from '@sapphire/framework';
import { getChannelAndSend } from '../cogs/verboseLog/utils.js';

const messageCache = new Map<string, string>();
export function clearMessageCache() {
    for (const key in messageCache) {
        messageCache.delete(key);
    }
}

async function getMessageString(name: string): Promise<string> {
    if (messageCache.has(name)) {
        return Promise.resolve(messageCache.get(name)!);
    }
    const messageOb = await BotMessage.findOne({ where: { name }, attributes: ['value'] });
    if (!messageOb) {
        try {
            await getChannelAndSend(`⚠️🚨Missing message ${name}🚨⚠️`);
        } catch (e) {
            container.logger.error(`Error in getChannelAndSend message ${name}: ${e}`);
        }
        return name;
    }
    messageCache.set(name, messageOb.value);
    return messageOb.value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMessage(name: string, args: Record<string, any>): Promise<string> {
    const message = await getMessageString(name);
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-implied-eval
        return new Function('return `' + message + '`;').call(args);
    } catch (e) {
        try {
            await getChannelAndSend(`⚠️🚨Error in message ${name}: ${e}🚨⚠️`);
        } catch (e) {
            container.logger.error(`Error in getChannelAndSend message ${name}: ${e}`);
        }
        return message;
    }
}
