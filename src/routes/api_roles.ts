import { Route } from '@sapphire/plugin-api';
import { Role } from '../lib/database/model.js';
import type { SchemaBundle } from "common/schema"
import { CR } from '../lib/api/CRUD.js';
import { RoleSchema } from 'common/schema';

export class ApiBotpMessagesList extends CR {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/roles'
      });
    }

    getModel() {
      return Role
    }
    getSchema(): SchemaBundle {
      return RoleSchema
    }
}
