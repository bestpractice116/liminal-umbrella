import { createFunctionPrecondition } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes } from '@sapphire/plugin-api';

export const Authenticated = () =>
  createFunctionPrecondition(
    (request: ApiRequest) => {
      console.log(request.auth);
      //Boolean(request.auth?.data.user),
      return false;
    },
    (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized));

export const AuthenticatedAdmin = () =>
  createFunctionPrecondition(
    (request: ApiRequest) => Boolean(request.auth),
    (_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized));
