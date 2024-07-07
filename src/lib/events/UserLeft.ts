import { User } from '../database/model.js';

export class UserLeft {
	constructor(
		public id: string,
		public username: string,
		public name: string,
		public nickname: string,
		public avatarURL: string,
		public joinedDiscordAt: Date,
		public dbUser: User
	) {}
}
