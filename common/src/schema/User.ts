import * as z from 'zod';
import { SchemaBundle } from './types.js';
import { dayJsCoerce, zodDay } from '../index.js';

const find = z.object({
    key: z.coerce.number().int().positive().transform((val) => `${val}`)
});
const read = find.merge(
    z.object({
        name: z.string({}),
        username: z.string({}),
        nickname: z.string({}),
        avatarURL: z.string({}),
        roles: z.array(
            z.object({
                name: z.string(),
                hexColor: z.string(),
                position: z.number().int()
            })
        ),
        lastSeenTime: z.preprocess(dayJsCoerce, zodDay),
        lastSeenChannel: z.string({}).optional(),
        lastSeenChannelName: z.string({}).optional(),
        lastSeenLink: z.string({}).optional(),
    })
);

export const UserSchema: SchemaBundle = {
    read: read.readonly(),
    find: find.readonly(),
    delete: false
};
export type UserListItem = z.infer<typeof read>;
