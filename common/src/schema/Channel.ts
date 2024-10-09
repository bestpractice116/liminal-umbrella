import * as z from 'zod';
import { SchemaBundle } from './types.js';
import { dayJsCoerce, zodDay } from '../index.js';

const find = z.object({
    key: z.coerce.number().int().positive()
});
const read = find.merge(
    z.object({
        name: z.string({}),
        type: z.string({}),
        parentId: z.string({}).optional(),
        position: z.number().int(),
        rawPosition: z.number().int(),
        createdTimestamp: z.number().int(),
        lastSeenIndexedToDate: z.preprocess(dayJsCoerce, zodDay),
        synced: z.boolean()
    })
);

export const ChannelSchema: SchemaBundle = {
    read: read.readonly(),
    find: find.readonly(),
    delete: false
};
export type ChannelListItem = z.infer<typeof read>;
