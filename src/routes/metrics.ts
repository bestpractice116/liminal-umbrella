import { ApplyOptions } from '@sapphire/decorators';
import { Route, methods, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import promClient from 'prom-client';

const register = new promClient.Registry();
register.setDefaultLabels({
    app: process.env.FLY_APP_NAME || 'local-test-bot'
});
promClient.collectDefaultMetrics({ register });

@ApplyOptions<Route.Options>({ route: 'metrics' })
export class UserRoute extends Route {
    public async [methods.GET](_: ApiRequest, response: ApiResponse) {
        response.setHeader('Content-Type', register.contentType);
        response.respond(await register.metrics());
    }
}
