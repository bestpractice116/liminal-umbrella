import { GuildMember } from 'discord.js';
import { User } from '../database/model.js';

export class UserChangedNickname {
	constructor(
		public id: string,
		public oldNickname: string,
		public newNickname: string,
		public dbUser: User,
		public discordUser: GuildMember
	) {}
}
