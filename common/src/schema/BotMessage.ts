import * as z from 'zod';
import { SchemaBundle } from './types.js';

const find = z.object({
	key: z.coerce.number().int().positive()
});
const update = z.object({
	name: z
		.string({
			required_error: 'Name is required',
			invalid_type_error: 'Name must be a string'
		})
		.trim()
		.min(2, { message: 'Name must be at least 2 characters long' })
		.max(100, { message: 'Name must be less than 100 characters' }),
	value: z
		.string({
			required_error: 'Name is required',
			invalid_type_error: 'Name must be a string'
		})
		.trim()
		.min(2, { message: 'Value must be at least 2 characters long' })
		.max(1000, { message: 'Value must be less than 1000 characters' })
});

export const BotMessageSchema: SchemaBundle = {
	update: update.readonly(),
	read: find.merge(update).readonly(),
	find: find.readonly(),
	delete: false
};
