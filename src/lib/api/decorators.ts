import { createFunctionPrecondition } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { User } from '../database/model.js';
import { Sequential } from '../utils.js';

declare module '@sapphire/plugin-api' {
	interface AuthData {
		nickname?: string;
		avatarURL?: string;
		roles?: string[];
	}
}

class AuthDecorators {
	@Sequential
	// This is kinda gross - just calling this method has a bunch of side effects
	// It sets the nickname, avatarURL, and roles on the request.auth object
	private static async getUser(request: ApiRequest): Promise<User | null> {
		if (!request.auth) return Promise.resolve(null);
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
		return u;
	}

	static Authenticated = createFunctionPrecondition(
		(request: ApiRequest, response: ApiResponse) => !response.writableEnded && this.getUser(request).then((user) => !!user),
		(_request: ApiRequest, response: ApiResponse) => !response.writableEnded && response.error(HttpCodes.Unauthorized)
	);

	static AuthenticatedAdmin = createFunctionPrecondition(
		(request: ApiRequest, response: ApiResponse) =>
			!response.writableEnded &&
			this.getUser(request).then((user) => !!user && !!user.roles && !!user!.roles.some((role) => role.name === 'Admin')),
		(_request: ApiRequest, response: ApiResponse) => !response.writableEnded && response.error(HttpCodes.Unauthorized)
	);

	static AuthenticatedWithRole = (roles: string | string[], beta: boolean) =>
		createFunctionPrecondition(
			(request: ApiRequest, response: ApiResponse) =>
				!response.writableEnded &&
				this.getUser(request).then((user) => {
					if (!user || !user!.roles) return false;
					if (beta) {
						if (!user.roles!.find((r) => r.name === 'BotBetaTester')) {
							return false;
						}
					}
					for (const role of Array(roles)) {
						if (user!.roles!.some((r) => r.name === role)) return true;
					}
					return user!.roles!.some((role) => role.name === 'Admin');
				}),
			(_request: ApiRequest, response: ApiResponse) => !response.writableEnded && response.error(HttpCodes.Unauthorized)
		);
}

export const Authenticated = () => AuthDecorators.Authenticated;

export const AuthenticatedAdmin = () => AuthDecorators.AuthenticatedAdmin;

export const AuthenticatedWithRole = (roles: string | string[], beta?: boolean) => AuthDecorators.AuthenticatedWithRole(roles, !!beta);
