import { BotMessage } from "./database/model.js";
import { container } from '@sapphire/framework';
import { getChannelAndSend } from '../cogs/verboseLog/utils.js';

const messageCache: {[propName: string]: string} = {};
export function clearMessageCache() {
    for (const key in messageCache) {
        delete messageCache[key];
    }
}

async function getMessageString(name: string): Promise<string> {
    if (messageCache[name]) {
        return Promise.resolve(messageCache[name]);
    }
    const messageOb = await BotMessage.findOne({ where: { name }, attributes: ['value'] });
    if (!messageOb) {
        try {
            await getChannelAndSend(`⚠️🚨Missing message ${name}🚨⚠️`);
        }
        catch(e) {
            container.logger.error(`Error in getChannelAndSend message ${name}: ${e}`);
        }
        return name;
    }
    messageCache[name] = messageOb.value;
    return messageOb.value;
}

export async function getMessage(name: string, args: {[propName: string]: any}): Promise<string> {
    const message = await getMessageString(name);
    try {
        return new Function("return `"+message +"`;").call(args)
    }
    catch(e) {
        try {
            await getChannelAndSend(`⚠️🚨Error in message ${name}: ${e}🚨⚠️`);
        }
        catch(e) {
            container.logger.error(`Error in getChannelAndSend message ${name}: ${e}`);
        }
        return message;
    }
}