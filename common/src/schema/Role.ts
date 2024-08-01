import * as z from 'zod';
import { SchemaBundle } from './types.js';

const find = z.object({
	key: z.coerce.number().int().positive()
});
const read = find.merge(
	z.object({
		name: z.string({}),
		mentionable: z.boolean(),
		hexColor: z.string()
	})
);

export const RoleSchema: SchemaBundle = {
	read: read.readonly(),
	find: find.readonly(),
	delete: false
};
export type RoleListItem = z.infer<typeof read>;
