import * as z from 'zod';
import { SchemaBundle } from './types.js';

const create = z.object({
	userKey: z
		.string({
			required_error: 'userKey is required',
			invalid_type_error: 'userKey must be a string'
		})
		.trim(),
	gameSessionKey: z.number().int('Must be an integer').min(1, { message: 'gameSessionKey must be positive integer' })
});
const read = create.merge(
	z.object({
		key: z.coerce.number().int().positive()
	})
);

export const GameSessionUserSignupSchema: SchemaBundle = {
	create: create.readonly(),
	find: create.readonly(),
	read: read.readonly(),
	delete: true
};
export type GameSessionUserSignupCreate = z.infer<typeof create>;
export type GameSessionUserSignupDelete = z.infer<typeof create>;
