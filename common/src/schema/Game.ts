import * as z from 'zod';
import { SchemaBundle } from './types.js';
import { dayJsCoerce, zodDay } from '../index.js';

export enum GameType {
    oneshot = 'oneshot',
    campaign = 'campaign',
    dropin = 'dropin'
}

export const gameSystemSchema = z.object({
    gamesystem: z.coerce.number({
        required_error: 'Game system is required',
    })
});

export const gameTypeSchema = z.object({
    type: z.nativeEnum(GameType)
});

const find = z.object({
    key: z.coerce.number().int().positive()
});
const baseUpdate = z
    .object({
        name: z
            .string({
                required_error: 'Name is required',
                invalid_type_error: 'Name must be a string'
            })
            .trim()
            .min(2, { message: 'Name must be at least 2 characters long' })
            .max(100, { message: 'Name must be less than 100 characters' }),
        description: z
            .string({
                required_error: 'Description is required',
                invalid_type_error: 'Description must be a string'
            })
            .trim()
            .min(50, { message: 'Description must be at least 50 characters long' })
            .max(500, { message: 'Description must be less than 500 characters' }),
        starttime: z.preprocess(dayJsCoerce, zodDay),
        endtime: z.preprocess(dayJsCoerce, zodDay),
        location: z
            .string({
                required_error: 'Location is required',
                invalid_type_error: 'Location must be a string'
            })
            .trim()
            .min(2, { message: 'Location must be at least 2 characters long' })
            .max(200, { message: 'Location must be less than 200 characters' }),
        maxplayers: z.number().int('Must be an integer').min(1, { message: 'Must have at least 1 player' }).max(8, { message: 'Max 8 players' })
    })
    .merge(gameSystemSchema)
    .merge(gameTypeSchema)
    .merge(find);

type updateInput = z.input<typeof baseUpdate> & { starttime?: unknown, endtime?: unknown }
type updateOutput = Omit<Omit<z.output<typeof baseUpdate>, 'starttime'>, 'endtime'> & { starttime?: ReturnType<typeof dayJsCoerce>, endtime?: ReturnType<typeof dayJsCoerce> }
const update: z.ZodType<updateOutput, z.ZodTypeDef, updateInput> = baseUpdate;

const user = z.object({
    key: z.string(),
    nickname: z.string(),
    avatarURL: z.string(),
    username: z.string()
});
const read = update.and(
    z.object({
        owner: user,
        signedupplayers: z.array(user),
        gameListingsMessageId: z.string(),
        eventId: z.string(),
        channelId: z.string(),
        gameListingsMessageLink: z.string(),
        eventLink: z.string(),
        channelLink: z.string()
    })
);

const create = update.and(find);

export const GameSchema: SchemaBundle = {
    // This is a strange case, as Game is Created from NewGame, but the update schema is used on
    // the frontend to check if it's okay to try posting to the backend.
    create: create.readonly(),
    update: update.readonly(),
    find: find.readonly(),
    read: read.readonly(),
    delete: true
};
export type GameFindItem = z.infer<typeof find>;
export type GameCreateItem = z.infer<typeof create>;
export type GameUpdateItem = z.infer<typeof update>;
export type GameReadItem = z.infer<typeof read>;
