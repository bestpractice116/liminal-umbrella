import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSession } from '../lib/database/model.js';
import { GameSchema } from 'common/schema';
import type { SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';
import { DM } from '../lib/api/decorators.js';
import { isAdmin } from '../lib/api/auth.js';

export class ApiGameSessionsList extends CR {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: 'api/gamesessions'
        });
    }

    getModel() {
        return GameSession;
    }
    getSchema(): SchemaBundle {
        return GameSchema;
    }
    @DM
    override async auth_GET() {}

    override async findAllWhere(request: ApiRequest) {
        if (isAdmin(request)) return {};
        return { owner: request.auth!.id };
    }
    override findAllOrder(): string[][] {
        return [['starttime', 'DESC']];
    }

    // Cannot be created by this method
    override async auth_CREATE(_request: ApiRequest, response: ApiResponse) {
        response.notFound();
    }
}
