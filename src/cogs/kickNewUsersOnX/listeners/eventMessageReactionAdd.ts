import { Listener, Events } from '@sapphire/framework';
import { MessageReaction } from 'discord.js';
import { GreetingMessage } from '../../../lib/database/model.js';
import { getMessage } from '../../../lib/message.js';
import { getGuildMemberById } from '../../../lib/discord.js';
import { Sequential } from '../../../lib/utils.js';

export class verboseLogBotStartedListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'kickNewUsersOnX',
			event: Events.MessageReactionAdd
		});
	}

	@Sequential
	async run(r: MessageReaction) {
		const db = await this.container.database.getdb();
		if (r.partial) {
			try {
				await r.fetch();
			} catch (error) {
				this.container.logger.error('Could not fetch reaction: ', error);
				return;
			}
		}
		console.log('Emoji name: ', r.emoji.name);
		return;
		/*
        const messageId = r.message.id;
        const greeting = await GreetingMessage.findOne({ include: ['user'], where: { messageId } });
        if (!greeting) return;
        const dbUser = greeting.user;
        const msg = await getMessage('USER_NO_NAME_CHANGE_KICK', {});
        const guildMember = await getGuildMemberById(dbUser.key);
        if (!guildMember) return;
        await db.transaction(async () => {
            dbUser.set({ kicked: true });
            await guildMember.kick(msg);
            await dbUser.save();
        });
        this.container.logger.info('verboseLog cog - botStarted');
        */
	}
}
