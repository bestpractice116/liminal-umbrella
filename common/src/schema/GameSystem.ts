import * as z from 'zod';
import { SchemaBundle } from './types.js';

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
		.min(2, { message: 'Description must be at least 2 characters long' })
		.max(100, { message: 'Description must be less than 100 characters' })
});
const find = z.object({
	key: z.coerce.number().int().positive()
});

export const GameSystemSchema: SchemaBundle = {
	create: create.readonly(),
	update: create.readonly(),
	find: find.readonly(),
	read: find.merge(create).readonly(),
	delete: true
};
