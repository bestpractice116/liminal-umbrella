import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { ActivityCacheClear } from '../lib/events/index.js';

//TODO - Add decorators to require authentication
export class ApiBotplayingEdit extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/botplaying/:key'
      });
    }

    public [methods.POST](request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Validate info is valid (activity name doesn't just contain whitespace, etc)
        // TODO - No XSS
        // TODO - Find and update activity in list
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.json({status: "ok", activity: request.body});
    }
    public [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Find and delete activity or 404
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.json({status: "deleted", activity: {"key": 1, type: "playing", name: "Just deleted Activity"}});
    }
}