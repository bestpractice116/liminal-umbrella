import { ApplyOptions } from '@sapphire/decorators';
import { Route, methods, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({ route: 'health' })
export class UserRoute extends Route {
	public [methods.GET](_: ApiRequest, response: ApiResponse) {
		return response.json({"iam": "ok"});
	}
}
