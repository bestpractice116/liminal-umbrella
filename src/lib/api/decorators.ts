import { createFunctionPrecondition } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes } from '@sapphire/plugin-api';

class AuthDecorators {
	static Authenticated = createFunctionPrecondition(
		(request: ApiRequest, response: ApiResponse) => !response.writableEnded && !!request.auth && !!request.auth.nickname,
		(_request: ApiRequest, response: ApiResponse) => !response.writableEnded && response.error(HttpCodes.Unauthorized)
	);

	static Admin = createFunctionPrecondition(
		(request: ApiRequest, response: ApiResponse) =>
			!response.writableEnded && !!request.auth && !!request.auth.roles && !!request.auth.roles.some((role) => role === 'Admin'),
		(_request: ApiRequest, response: ApiResponse) => !response.writableEnded && response.error(HttpCodes.Unauthorized)
	);

	static AuthenticatedWithRole = (roles: string | string[]) =>
		createFunctionPrecondition(
			(request: ApiRequest, response: ApiResponse) => {
				if (!response.writableEnded && !!request.auth && !!request.auth.roles) {
					if (request.auth.roles.some((role) => role === 'Admin')) {
						return true;
					}
					for (const role of Array(roles)) {
						if (request.auth.roles.some((r) => r === role)) return true;
					}
				}
				return false;
			},
			(_request: ApiRequest, response: ApiResponse) => !response.writableEnded && response.error(HttpCodes.Unauthorized)
		);
}

export const Authenticated = () => AuthDecorators.Authenticated;

export const Admin = () => AuthDecorators.Admin;

export const WithRole = (roles: string | string[]) => AuthDecorators.AuthenticatedWithRole(roles);

export const Beta = () => AuthDecorators.AuthenticatedWithRole('BotBetaTester');
