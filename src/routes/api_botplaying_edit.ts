import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { ActivityCacheClear } from '../lib/events/index.js';
import { Activity } from '../lib/database/model.js';

type ActivityUpdate = {
    name: string;
}

//TODO - Add decorators to require authentication
export class ApiBotplayingEdit extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/botplaying/:key'
      });
    }

    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Validate info is valid (activity name doesn't just contain whitespace, etc)
        // TODO - No XSS
        // TODO - Find and update activity in list
        const activity = await Activity.findOne({where: {id: request.params.key}});
        const u = request.body as ActivityUpdate;
        activity!.name = u.name;
        await activity!.save();
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.json({status: "ok", activity: request.body});
    }
    public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Find and delete activity or 404
        const activity = await Activity.findOne({where: {id: request.params.key}});
        await activity!.destroy();
        this.container.events.emit('activityCacheClear', new ActivityCacheClear());
        response.json({status: "deleted", activity: {"key": 1, type: "playing", name: "Just deleted Activity"}});
    }
}