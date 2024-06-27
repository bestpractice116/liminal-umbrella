import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { BotMessage } from '../lib/database/model.js';
import { BotMessageSchema } from "common/schema";
import type { SchemaBundle } from "common/schema"
import { UD } from '../lib/api/CRUD.js';

export class ApiBotpMessagesEdit extends UD {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
      super(context, {
        ...options,
        route: 'api/botmessages/:key'
      });
    }

    getModel() {
      return BotMessage
    }
    getSchema(): SchemaBundle {
      return BotMessageSchema
    }
}