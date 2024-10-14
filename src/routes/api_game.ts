import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSystem, PlannedGame } from '../lib/database/model.js';
import type { GameReadItem, SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';
import { NewGameSchema } from 'common/schema';
import { DM } from '../lib/api/decorators.js';
import { InferCreationAttributes } from '@sequelize/core';

export async function doCoerce(request: ApiRequest, response: ApiResponse, data: Partial<GameReadItem>): Promise<Omit<InferCreationAttributes<PlannedGame>, 'key'> | null> {
    const {gamesystem, ...out} = {
        ...data,
        owner: request.auth!.id
    };
    if (gamesystem) {
        const gamesystemOb = await GameSystem.findOne({ where: { name: gamesystem } });
        if (!gamesystemOb) {
            response.badRequest('Cannot find game system');
            return null;
        }
        return {
            ...out,
            gamesystem: gamesystemOb.key
        }
    }
    return out;
}

export class ApiGameList extends CR {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: 'api/game'
        });
    }

    getModel() {
        return PlannedGame;
    }
    getSchema(): SchemaBundle {
        return NewGameSchema;
    }

    @DM
    override async auth_GET() {}

    @DM
    override async auth_CREATE() {}

    override async CREATE_coerce(request: ApiRequest, response: ApiResponse, data: unknown): Promise<Omit<InferCreationAttributes<PlannedGame>, 'key'> | null> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        return await doCoerce(request, response, data as any);
    }

    override async findAllWhere(request: ApiRequest) {
        return { owner: request.auth!.id };
    }
}
