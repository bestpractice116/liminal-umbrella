import { createFunctionPrecondition } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { User } from '../database/model.js';
import {Sequential} from '../utils.js';

class AuthDecorators {
  @Sequential
  private static getUser(request: ApiRequest): Promise<User | null> {
    if (!request.auth) return Promise.resolve(null);
    return User.findOne({
      where: {id: request.auth.id},
      attributes: ['id', 'avatarURL', 'nickname'],
      include: ['roles'],
    });
  }

  static Authenticated = createFunctionPrecondition(
    async (request: ApiRequest) => !!this.getUser(request),
    (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized));

  static AuthenticatedAdmin =
    createFunctionPrecondition(
      (request: ApiRequest) => this.getUser(request).then(user => !!user && !!user.roles && !!user!.roles.some(role => role.name === 'Admin')),
      (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized));

  static AuthenticatedWithRole = (roles : string | string[]) =>
    createFunctionPrecondition(
      (request: ApiRequest) => this.getUser(request).then(user => {
        if (!!user || !!user!.roles) return false
        for (const role of Array(roles)) {
          if (user!.roles!.some(r => r.name === role)) return true
        }
        return user!.roles!.some(role => role.name === 'Admin')
      }),
      (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized));
}

export const Authenticated = () => AuthDecorators.Authenticated;

export const AuthenticatedAdmin = () => AuthDecorators.AuthenticatedAdmin;

export const AuthenticatedWithRole = (roles : string | string[]) => AuthDecorators.AuthenticatedWithRole(roles);