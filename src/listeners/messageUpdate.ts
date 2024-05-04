import { Listener } from '@sapphire/framework';
import { Message } from 'discord.js';
import {Sequential} from '../lib/utils.js';

export class MessageUpdateEvent extends Listener {
	@Sequential
	public override run(_: Message, newMessage: Message) {
        this.container.database.indexMessage(newMessage);
        return
	}
}