import { Route } from '@sapphire/plugin-api';
import { CampaignSchema } from 'common/schema';
import type { SchemaBundle } from 'common/schema';
import { UD } from '../lib/api/CRUD.js';
import { Campaign } from '../lib/database/model.js';

export class ApiCampaigngEdit extends UD {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: 'api/campaign/:key'
        });
    }

    getModel() {
        return Campaign;
    }
    getSchema(): SchemaBundle {
        return CampaignSchema;
    }
}
