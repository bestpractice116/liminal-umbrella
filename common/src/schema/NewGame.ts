import * as z from 'zod';
import { SchemaBundle } from './types.js';
import { dayJsCoerceOrUndefined, zodDay } from '../index.js';
import { gameTypeSchema, gameSystemSchema } from './Game.js';

const baseCreate = z
    .object({
        name: z
            .string({
                required_error: 'Name is required',
                invalid_type_error: 'Name must be a string'
            })
            .trim(),
        description: z
            .string({
                required_error: 'Description is required',
                invalid_type_error: 'Description must be a string'
            })
            .trim(),
        date: z.optional(z.preprocess(dayJsCoerceOrUndefined, z.union([zodDay, z.undefined()]))),
        starttime: z.optional(z.preprocess(dayJsCoerceOrUndefined, z.union([zodDay, z.undefined()]))),
        endtime: z.optional(z.preprocess(dayJsCoerceOrUndefined, z.union([zodDay, z.undefined()]))),
        location: z
            .string({
                required_error: 'Location is required',
                invalid_type_error: 'Location must be a string'
            })
            .trim(),
        maxplayers: z.number().int('Must be an integer').min(1, { message: 'Must have at least 1 player' }).max(8, { message: 'Max 8 players' })
    })
    .merge(gameSystemSchema)
    .merge(gameTypeSchema)
    .partial();

type createInput = z.input<typeof baseCreate> & { starttime?: unknown, endtime?: unknown }
type createOutput = Omit<Omit<z.output<typeof baseCreate>, 'starttime'>, 'endtime'> & { starttime?: ReturnType<typeof dayJsCoerceOrUndefined>, endtime?: ReturnType<typeof dayJsCoerceOrUndefined> }
const create: z.ZodType<createOutput, z.ZodTypeDef, createInput> = baseCreate;
    

const find = z.object({
    key: z.coerce.number().int().positive()
});

const baseRead = baseCreate.merge(find);
type readInput = z.input<typeof baseRead>
type readOutput = z.output<typeof baseRead>
const read: z.ZodType<readOutput, z.ZodTypeDef, readInput> = baseRead;

export const NewGameSchema: SchemaBundle = {
    create: create.readonly(),
    update: create.readonly(),
    find: find.readonly(),
    read: read.readonly(),
    delete: true
};
export type NewGameListItem = z.infer<typeof find>;
