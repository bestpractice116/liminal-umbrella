import { GuildScheduledEvent, User as GuildUser } from 'discord.js';
import { GameSession, GameSessionUserSignup } from '../database/model.js';

export class UserDisinterestedInGame {
	constructor(
		public eventId: string,
		public guildScheduledEvent: GuildScheduledEvent,
		public gameSessionId: number,
		public gameSession: GameSession,
		public userId: string,
		public guildUser: GuildUser,
		public gameSessionUserSignup: GameSessionUserSignup
	) {}
}
