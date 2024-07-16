import { Middleware } from '@sapphire/plugin-api';
import { ApiRequest, ApiResponse } from '@sapphire/plugin-api';
import { User } from '../lib/database/model.js';
import { Sequential } from '../lib/utils.js';

declare module '@sapphire/plugin-api' {
	interface AuthData {
		nickname?: string;
		avatarURL?: string;
		roles?: string[];
	}
}

export class DecorateAuth extends Middleware {
	@Sequential
	public override async run(request: ApiRequest, _response: ApiResponse) {
		if (request.auth) {
			const u = await User.findOne({
				where: { key: request.auth.id },
				attributes: ['key', 'avatarURL', 'nickname'],
				include: ['roles']
			});
			if (u) {
				request.auth.nickname = u.nickname;
				request.auth.avatarURL = u.avatarURL;
				const roles = u.roles || [];
				request.auth.roles = roles.map((r) => r.name);
			}
		}
	}
}
