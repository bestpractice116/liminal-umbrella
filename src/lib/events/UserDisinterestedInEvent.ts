import { GuildScheduledEvent } from 'discord.js';
import { EventInterest } from '../database/model.js';

export class UserDisinterestedInEvent {
	constructor(
		public guildScheduledEventId: string,
		public guildScheduledEvent: GuildScheduledEvent,
		public userId: string,
		public eventInterest: EventInterest
	) {}
}
