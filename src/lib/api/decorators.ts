import { createFunctionPrecondition } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { User } from '../database/model.js';

function getUser(request: ApiRequest): Promise<User | null> {
  if (!request.auth) return Promise.resolve(null);
  return User.findOne({
    where: {id: request.auth.id},
    attributes: ['id', 'avatarURL', 'nickname'],
    include: ['roles'],
  });
}

export const Authenticated = () =>
  createFunctionPrecondition(
    async (request: ApiRequest) => !!getUser(request),
    (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized));

export const AuthenticatedAdmin = () =>
  createFunctionPrecondition(
    (request: ApiRequest) => getUser(request).then(user => !!user && !!user.roles && !!user!.roles.some(role => role.name === 'Admin')),
    (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized));

export const AuthenticatedWithRole = (roles : string | string[]) =>
  createFunctionPrecondition(
    (request: ApiRequest) => getUser(request).then(user => {
      if (!!user || !!user!.roles) return false
      for (const role of Array(roles)) {
        if (user!.roles!.some(r => r.name === role)) return true
      }
      return user!.roles!.some(role => role.name === 'Admin')
    }),
    (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized));
