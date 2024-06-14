//import { container } from '@sapphire/framework';
import type { LoginData } from '@sapphire/plugin-api';
import type { RESTGetAPICurrentUserResult } from 'discord.js';
import {Sequential} from '../utils.js';
import { User } from '../database/model.js';

export interface UserAuthData extends RESTGetAPICurrentUserResult {
    nickname: string;
    avatarURL: string;
}

export interface TransformedLoginData extends LoginData {
  roles: string[];
}

interface LoginError {
  error: string;
}

class AuthTransformer {
  @Sequential
  public async transform(loginData: LoginData): Promise<TransformedLoginData | LoginError> {
    if (!loginData.user) {
      return { error: 'No user in login data' };
    }
    const u = await User.findByPk(loginData.user.id);
    if (!u) {
      return {"error": "User not found in database - probably not a member of this Discord server"};
    }
    if (u.left) {
      return {"error": "User has left the server"};
    }
    if (u.bot) {
      return {"error": "User is a bot"};
    }

    const userAuthData = {
      ...loginData.user,
      nickname: u.nickname,
      avatarURL: u.avatarURL,
    };
    const roles = (await u.getRoles()).map(r => r.name);

    return { ...loginData, user: userAuthData, roles };
  }
}
const t = new AuthTransformer();
export default function authTransformer(loginData: LoginData): Promise<TransformedLoginData | LoginError> {
  return t.transform(loginData);
}
