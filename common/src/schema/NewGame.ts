import * as z from 'zod';
import { SchemaBundle } from './types.js';
import { dayJsCoerce, zodDay } from '../index.js';
import { gameTypeSchema, gameSystemSchema } from './Game.js';

const create = z
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
		starttime: z.preprocess(dayJsCoerce, zodDay),
		endtime: z.preprocess(dayJsCoerce, zodDay),
		location: z
			.string({
				required_error: 'Location is required',
				invalid_type_error: 'Location must be a string'
			})
			.trim(),
		maxplayers: z.number().int('Must be an integer').min(1, { message: 'Must have at least 1 player' }).max(8, { message: 'Max 8 players' })
	})
	.merge(gameSystemSchema)
	.merge(gameTypeSchema);
const find = z.object({
	key: z.coerce.number().int().positive()
});

export const NewGameSchema: SchemaBundle = {
	create: create.partial().readonly(),
	update: create.partial().readonly(),
	find: find.readonly(),
	read: create.partial().merge(find).readonly(),
	delete: true
};
export type NewGameListItem = z.infer<typeof create>;
