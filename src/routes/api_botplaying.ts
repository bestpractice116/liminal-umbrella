import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { ActivityCacheClear } from '../lib/events/index.js';
import { Activity } from '../lib/database/model.js';
import { ActivityType } from '../lib/database/model/Activity.js';


type ActivityCreate = {
    name: string;
}

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
        const activities = await Activity.findAll({ where: { type: 'playing'}});
        const playing = activities.map(activity => {return {key: activity.id, type: activity.type, name: activity.name}});
        response.json({playing})
    }

    // Add a new one
    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Validate info is valid (activity name doesn't just contain whitespace, etc)
        // TODO - Add new activity to list, return actual ID
        console.log(request.body)
        const u = request.body as ActivityCreate;
        const activity = await Activity.create({type: ActivityType.Playing, name: u.name});
        console.log("EMIT CACHE CLEAR");
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.json({status: "ok", activity: {"key": activity.id, type: "playing", name: activity.name}});
    }
}