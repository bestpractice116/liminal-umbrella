import * as z from 'zod';
import { SchemaBundle } from './types.js';
import { Dayjs, dayJsCoerce, zodDay } from '../index.js';

const find = z.object({
    key: z.coerce.number().int().positive().transform((val) => `${val}`)
});
const baseRead = find.merge(
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
        joinedDiscordAt: z.preprocess(dayJsCoerce, zodDay),
        joinedGuildAt: z.preprocess(dayJsCoerce, zodDay),
        kicked: z.boolean(),
        winnowed: z.boolean(),
        previousRoles: z.preprocess((str) => JSON.parse(str as string), z.array(z.string()))
    })
);

type readInput = z.input<Omit<Omit<Omit<Omit<typeof baseRead, 'lastSeenTime'>, 'joinedDiscordAt'>, 'joinedGuildAt'>, 'previousRoles'> & { previousRoles: unknown, lastSeenTime: unknown, joinedDiscordAt: unknown, joinedGuildAt: unknown }>
type readOutput = z.output<Omit<Omit<Omit<Omit<typeof baseRead, 'lastSeenTime'>, 'joinedDiscordAt'>, 'joinedGuildAt'>, 'previousRoles'> & { previousRoles: string[], lastSeenTime: Dayjs, joinedDiscordAt: Dayjs, joinedGuildAt: Dayjs }>
const read: z.ZodType<readOutput, z.ZodTypeDef, readInput> = baseRead;

export const UserSchema: SchemaBundle = {
    read: read.readonly(),
    find: find.readonly(),
    delete: false
};
export type UserListItem = z.infer<typeof read>;
