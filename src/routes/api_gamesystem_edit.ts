import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { GameSystem } from '../lib/database/model.js';
import { GameSystemSchema } from "common/schema";
import { AuthenticatedAdmin } from '../lib/api/decorators.js';
import { Sequential } from '../lib/utils.js';

export class ApiGameSystemEdit extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/gamesystem/:key'
      });
    }

    private async findGameSystem(params: ApiRequest['params'], response: ApiResponse): Promise<GameSystem | null> {
      const { success, error, data } = GameSystemSchema.delete.safeParse(params);
      if (!success) {
          response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
          return null;
      }
      const activity = await GameSystem.findOne({where: data});
      if (!activity) {
          response.status(HttpCodes.NotFound).json({status: "error", error: "Activity not found"});
          return null;
      }
      return activity;
    }

    @AuthenticatedAdmin()
    @Sequential
    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
      const gamesystem = await this.findGameSystem(request.params, response);
      if (!gamesystem) {
          return;
      }
      const { success, error, data } = GameSystemSchema.update.safeParse(request.body);
        if (!success) {
            response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
            return;
        }
        gamesystem.set(data);
        await gamesystem.save();
        response.json({status: "ok", activity: data});
    }

    @AuthenticatedAdmin()
    @Sequential
    public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
      const gamesystem = await this.findGameSystem(request.params, response);
      if (!gamesystem) {
          return;
      }
        await gamesystem.destroy();
        response.json({status: "deleted", gamesystem: request.params});
    }
}