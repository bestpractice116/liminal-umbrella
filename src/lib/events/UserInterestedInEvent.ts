import { GuildScheduledEvent, User } from 'discord.js';
import { EventInterest } from '../database/model.js';

export class UserInterestedInEvent {
	constructor(
		public guildScheduledEventId: string,
		public guildScheduledEvent: GuildScheduledEvent,
		public userId: string,
		public user: User,
		public eventInterest: EventInterest
	) {}
}
