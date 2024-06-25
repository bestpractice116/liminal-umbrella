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
        const gamesystems = await GameSystem.findAll({ where: { }});
        response.json(gamesystems.map(gamesystem => {return {key: gamesystem.key, name: gamesystem.name, description: gamesystem.description}}))
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
        const gamesystem = await GameSystem.create(data as any);
        response.status(HttpCodes.Created).json({status: "ok", gamesystem: {key: gamesystem.key, name: gamesystem.name, description: gamesystem.description}});
    }
}
