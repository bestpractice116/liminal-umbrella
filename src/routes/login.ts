import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { serveRoot } from './root.js';

export class LoginRoute extends Route {
  public constructor(context: Route.LoaderContext, options: Route.Options) {
    super(context, {
      ...options,
      route: '/login'
    });
  }

  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    serveRoot(_request, response);
  }
}