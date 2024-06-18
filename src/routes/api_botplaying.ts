import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { getActivityList } from '../cogs/randomActivity/activity.js';
import { ActivityCacheClear } from '../lib/events/index.js';

//TODO - Add decorators to require authentication
export class ApiBotplayingList extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/botplaying'
      });
    }

    // Get current list
    public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
        // TODO - Change list into map of IDs
        const list = await getActivityList();
        const playing = list.map((activity, index) => ({key: index, type: "playing", name: activity}));
        response.json({playing})
    }

    // Add a new one
    public [methods.POST](_request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Validate info is valid (activity name doesn't just contain whitespace, etc)
        // TODO - Add new activity to list, return actual ID
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.json({status: "ok", activity: {"key": 38, type: "playing", name: "New Activity"}});
    }
}