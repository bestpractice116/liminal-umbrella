import { Route } from '@sapphire/plugin-api';
import { Channel, User } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { CR } from '../lib/api/CRUD.js';
import { UserSchema } from 'common/schema';

export class ApiUsersList extends CR {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: 'api/user'
        });
    }

    getModel() {
        return User;
    }
    getSchema(): SchemaBundle {
        return UserSchema;
    }

    override async getReadObjectFromDbObject(item: any) {
        const readOb = await super.getReadObjectFromDbObject(item);
        if (!readOb) return readOb;
        const channelNameCache = new Map<string, string>();
        if (readOb.lastSeenChannel) {
            readOb.lastSeenChannelName = channelNameCache.get(readOb.lastSeenChannel);
            if (!channelNameCache.has(readOb.lastSeenChannel)) {
                const channel = await Channel.findByPk(readOb.lastSeenChannel);
                if (channel) channelNameCache.set(readOb.lastSeenChannel, channel?.name);
                readOb.lastSeenChannelName = channel?.name
            }
        }
        return readOb;
    }

    override findAllInclude() {
        return ['roles'];
    }
    override async findAllWhere() {
        return Promise.resolve({ bot: false });
    }
}
