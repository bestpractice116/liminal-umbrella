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
		.max(100, { message: 'Description must be less than 100 characters' }),
	tag: z
		.string({
			required_error: 'Tagis required',
			invalid_type_error: 'Tag must be a string'
		})
		.trim()
		.min(5, { message: 'Tag must be at least 5 characters long' })
		.max(50, { message: 'Tag must be less than 50 characters' })
});
const find = z.object({
	key: z.coerce.number().int().positive()
});
const read = find.merge(create);

export const GameSystemSchema: SchemaBundle = {
	create: create.readonly(),
	update: create.readonly(),
	find: find.readonly(),
	read: read.readonly(),
	delete: true
};
export type GameSystemListItem = z.infer<typeof read>;
