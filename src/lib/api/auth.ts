import { ApiRequest } from '@sapphire/plugin-api';

export function isRole(request: ApiRequest, rolename: string) {
	if (request.auth?.roles && !!request.auth.roles.find((role) => role === rolename)) return true;
	return false;
}

export function isAdmin(request: ApiRequest) {
	return isRole(request, 'Admin');
}

export function isDM(request: ApiRequest) {
	return isRole(request, 'DungonMaster');
}
