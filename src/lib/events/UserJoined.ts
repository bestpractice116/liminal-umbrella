import { GuildMember } from 'discord.js';
import { User } from '../database/model.js';

export class UserJoined {
  constructor(
    public id: string,
    public name: string,
    public nickname: string,
    public exMember: boolean,
    public dbUser: User,
    public discordUser: GuildMember,
  ) {}
}
