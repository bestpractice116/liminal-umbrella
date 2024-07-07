import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { serveRoot } from './root.js';

export class AdminRoute extends Route {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'admin/:page'
		});
	}

	public [methods.GET](request: ApiRequest, response: ApiResponse) {
		serveRoot(request, response);
	}
}
