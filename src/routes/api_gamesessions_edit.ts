import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSession } from '../lib/database/model.js';
import { GameSchema } from 'common/schema';
import type { GameUpdateItem, SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { DM } from '../lib/api/decorators.js';
import { isAdmin } from '../lib/api/auth.js';
import { InferAttributes } from '@sequelize/core';

export class ApiGameSessions extends UD {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: 'api/gamesessions/:key'
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

    override async getRetrieveWhere(request: ApiRequest) {
        if (isAdmin(request)) return Promise.resolve({});
        return Promise.resolve({ owner: request.auth!.id });
    }

    @DM
    override async auth_DELETE(_request: ApiRequest, _response: ApiResponse) {}

    override async DELETE_disallowed(item: GameSession, _request: ApiRequest): Promise<string | undefined> {
        const now = new Date(Date.now());
        if (item.starttime < now) {
            return 'Cannot delete game sessions which start in the past';
        }
        return;
    }

    @DM
    override async auth_UPDATE(_request: ApiRequest, _response: ApiResponse) {}

    override UPDATE_disallowed(item: GameSession): string | undefined {
        const now = new Date(Date.now());
        if (item.starttime < now) {
            return 'Cannot update game sessions which start in the past';
        }
        return;
    }

    override async UPDATE_coerce(_request: ApiRequest, response: ApiResponse, data: GameUpdateItem): Promise<Partial<InferAttributes<GameSession>> | null> {
        // FIXME - this is gross, these should be dayjs objects already
        const starttime = new Date(data.starttime as unknown as Date);
        const endtime = new Date(data.endtime as unknown as Date);

        if (isNaN(starttime.getTime())) {
            response.badRequest('starttime is invalid'); return null;
        }
        if (isNaN(endtime.getTime())) {
            response.badRequest('starttime is invalid'); return null;
        }

        const now = new Date(Date.now());
        if (starttime < now) {
            // Session started in the past, not valid
            response.badRequest('Session start is in the past, cannot edit'); return null;
        }
        if (endtime < starttime) {
            // End time cannot be before start time, not valid
            response.badRequest('End time cannot be before start time - invalid game'); return null;
        }

        return { ...data, starttime, endtime };
    }
}
