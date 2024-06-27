import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { BotMessage } from '../lib/database/model.js';
import { BotMessageSchema } from "common/schema";
import type { SchemaBundle } from "common/schema"
import { CR } from '../lib/api/CRUD.js';

export class ApiBotpMessagesList extends CR {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/botplaying'
      });
    }

    getModel() {
      return BotMessage
    }
    getSchema(): SchemaBundle {
      return BotMessageSchema
    }

    override async [methods.POST](_request: ApiRequest, response: ApiResponse) {
        response.notFound()
    }
}
