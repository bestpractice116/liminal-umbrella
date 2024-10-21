import * as z from 'zod';
import { SchemaBundle } from './types.js';
import {gameDescriptionSchema, gameLocationSchema, gameMaxPlayersSchema, gameNameSchema, gameSystemSchema, gameTypeSchema} from "./Game";
import { baseUser } from './User.js';

const find = z.object({
    key: z.coerce.number().int().positive()
});
const update = z
    .object({})
    .merge(gameNameSchema)
    .merge(gameDescriptionSchema)
    .merge(gameMaxPlayersSchema)
    .merge(gameLocationSchema)
    .merge(find);

const read = update.merge(
    z.object({
        owner: baseUser,
        gameListingsMessageId: z.string(),
    })
);

const create = update.merge(gameSystemSchema).merge(gameTypeSchema);

export const CampaignSchema: SchemaBundle = {
    // This is a strange case, as Game is Created from NewGame, but the update schema is used on
    // the frontend to check if it's okay to try posting to the backend.
    create: create.readonly(),
    update: update.readonly(),
    find: find.readonly(),
    read: read.readonly(),
    delete: true
};
export type CampaignFindItem = z.infer<typeof find>;
export type CampaignCreateItem = z.infer<typeof create>;
export type CampaignUpdateItem = z.infer<typeof update>;
export type CampaignReadItem = z.infer<typeof read>;
