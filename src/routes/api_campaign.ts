import { Route } from '@sapphire/plugin-api';
import { Campaign } from '../lib/database/model.js';
import { CampaignSchema } from 'common/schema';
import type { SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';

export class ApiCampaignList extends CR {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: 'api/campaign'
        });
    }

    getModel() {
        return Campaign;
    }
    getSchema(): SchemaBundle {
        return CampaignSchema;
    }
}
