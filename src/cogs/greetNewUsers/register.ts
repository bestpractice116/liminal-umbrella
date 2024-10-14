import { getChannelName } from './utils.js';
import { getTextChannel } from '../../lib/discord.js';
import { SapphireClient, container } from '@sapphire/framework';

function postLogin(this: SapphireClient) {
    console.log('DOING PLUGIN REGISTRATION POST LOGIN');
    const channelName = getChannelName();
    if (!channelName) return;
    const channel = getTextChannel(channelName);
    if (!channel) return;
    container.database.indexChannel(channel.id);
}

SapphireClient.plugins.registerPostLoginHook(postLogin, 'GreetNewUsersRegister-PreLogin');
