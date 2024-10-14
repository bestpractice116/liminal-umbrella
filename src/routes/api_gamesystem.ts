import { Route } from '@sapphire/plugin-api';
import { GameSystem } from '../lib/database/model.js';
import { GameSystemSchema } from 'common/schema';
import type { SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';
import { DM } from '../lib/api/decorators.js';

export class ApiGameSystemList extends CR {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: 'api/gamesystem'
        });
    }

    getModel() {
        return GameSystem;
    }
    getSchema(): SchemaBundle {
        return GameSystemSchema;
    }

    @DM
    override async auth_GET() {/* empty */}
}
