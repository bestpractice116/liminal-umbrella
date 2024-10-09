import { getChannelName } from './utils.js';
import { getTextChannel } from '../../lib/discord.js';
import { postLogin, SapphireClient, container } from '@sapphire/framework';

export class GreetNewUsersRegister {
    public static async [postLogin](this: SapphireClient): Promise<void> {
        console.log('DOING PLUGIN REGISTRATION POST LOGIN');
        const channelName = getChannelName();
        if (!channelName) return;
        const channel = await getTextChannel(channelName);
        if (!channel) return;
        container.database.indexChannel(channel.id);
    }
}

SapphireClient.plugins.registerPostLoginHook(GreetNewUsersRegister[postLogin], 'GreetNewUsersRegister-PreLogin');
