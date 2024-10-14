import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { Channel, User } from '../lib/database/model.js';
import type { SchemaBundle } from 'common/schema';
import { CR, zodParseOrError, type CRUDReadable } from '../lib/api/CRUD.js';
import { UserSchema } from 'common/schema';
import { Sequential } from '../lib/utils.js';
import * as z from 'zod';
import { UserWinnow } from '../lib/events/UserWinnow.js';

const userDeleteSchema = z.object({
    userIds: z.array(z.string()),
});

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

     
    override async getReadObjectFromDbObject(item: CRUDReadable | undefined) {
        const readOb = await super.getReadObjectFromDbObject(item);
        if (!readOb) return readOb;
        const channelNameCache = new Map<string, string>();
         
        if (readOb.lastSeenChannel) {
             
            readOb.lastSeenChannelName = channelNameCache.get(`${readOb.lastSeenChannel}`);
             
            if (!channelNameCache.has(`${readOb.lastSeenChannel}`)) {
                 
                const channel = await Channel.findByPk(readOb.lastSeenChannel);
                 
                if (channel) channelNameCache.set(`${readOb.lastSeenChannel}`, channel.name);
                 
                readOb.lastSeenChannelName = channel?.name
            }
        }
         
        return readOb;
    }

    override findAllInclude() {
        return ['roles'];
    }
    override async findAllWhere() {
        return Promise.resolve({ bot: false, left: false });
    }

    @Sequential
    public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
        this.container.logger.info('DELETE user request with body ', JSON.stringify(request.body));
        const data = zodParseOrError(userDeleteSchema, request.body, response);
        this.container.logger.info('DELETE user request with data ', JSON.stringify(data));
        if (response.writableEnded) return;
        if (!data) return;
        
        this.container.logger.info(`DELETE request for IDs ${data.userIds.join(', ')}`);
        for (const id of data.userIds) {
            this.container.logger.info(`LOOKUP USER ${id} for winnow event`);
            const user = await User.findByPk(id)
            if (!user) continue;
            this.container.logger.info(`Send winnow event for user ID ${id}`)
            this.container.events.emit('userWinnow', new UserWinnow(id, user));
        }
        response.json({ status: 'deleted', ids: data.userIds });
    }
}
