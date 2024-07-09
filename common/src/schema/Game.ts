import * as z from 'zod';
import { SchemaBundle } from './types.js';

export enum GameType {
	Oneshot = 'One shot',
	Ongoing = 'Ongoing Campaign',
	Dropin = 'Drop In Campaign'
}

const create = z.object({
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
		.max(2000, { message: 'Description must be less than 2000 characters' }),
	type: z.nativeEnum(GameType),
	startttime: z
		.string({
			required_error: 'Start time required',
			invalid_type_error: 'Start time must be a string'
		})
		.trim()
		.min(4, { message: 'Start time must be at least 4 characters long' })
		.max(5, { message: 'Start time must be less than 6 characters' }),
	endttime: z
		.string({
			required_error: 'End time required',
			invalid_type_error: 'End time must be a string'
		})
		.trim()
		.min(4, { message: 'End time must be at least 4 characters long' })
		.max(5, { message: 'End time must be less than 6 characters' }),
	location: z
		.string({
			required_error: 'Location is required',
			invalid_type_error: 'Location must be a string'
		})
		.trim()
		.min(2, { message: 'Location must be at least 2 characters long' })
		.max(200, { message: 'Location must be less than 200 characters' }),
	maxplayers: z.number().int('Must be an integer').min(1, { message: 'Must have at least 1 player' }).max(8, { message: 'Max 8 players' })
});
const find = z.object({
	key: z.coerce.number().int().positive()
});

export const GameSchema: SchemaBundle = {
	create: create.readonly(),
	update: create.readonly(),
	find: find.readonly(),
	read: find.merge(create).readonly(),
	delete: true
};
export type GameListItem = z.infer<typeof GameSchema.read>;
