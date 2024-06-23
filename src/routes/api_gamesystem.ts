import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { GameSystem } from '../lib/database/model.js';
import { GameSystemSchema } from "common/schema";
import { AuthenticatedAdmin } from '../lib/api/decorators.js';
import {Sequential} from '../lib/utils.js';


//TODO - Add decorators to require authentication
export class ApiBotplayingList extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/gamesystem'
      });
    }

    // Get current list
    @AuthenticatedAdmin()
    @Sequential
    public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
        const activities = await GameSystem.findAll({ where: { }});
        const playing = activities.map(gamesystem => {return {key: gamesystem.key, name: gamesystem.name}});
        response.json({playing})
    }

    // Add a new one
    @AuthenticatedAdmin()
    @Sequential
    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
        const { success, error, data } = GameSystemSchema.create.safeParse(request.body);
        if (!success) {
            response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
            return;
        }
        const gamesystem = await GameSystem.create(data);
        response.status(HttpCodes.Created).json({status: "ok", GameSystem: {"key": gamesystem.key, name: gamesystem.name, description: gamesystem.description}});
    }
}
