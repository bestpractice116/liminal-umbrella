import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';



//TODO - Add decorators to require authentication
export class ApiBotplayingEdit extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/botplaying/:id'
      });
    }

    public [methods.GET](_request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Find and delete activity or 404
        console.log("FIFOQ@EIJFJJ");
        response.json({status: "deleted", activity: {"id": 1, type: "playing", name: "Just deleted Activity"}});
    }

    public [methods.POST](_request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Validate info is valid (activity name doesn't just contain whitespace, etc)
        // TODO - Find and update activity in list
        response.json({status: "ok", activity: {"id": 1, type: "playing", name: "New Activity"}});
    }
    public [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
        // TODO - Validate request contains info we need
        // TODO - Find and delete activity or 404
        response.json({status: "deleted", activity: {"id": 1, type: "playing", name: "Just deleted Activity"}});
    }
}