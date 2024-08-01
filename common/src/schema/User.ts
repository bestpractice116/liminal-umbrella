import * as z from 'zod';
import { SchemaBundle } from './types.js';

const find = z.object({
	key: z.coerce.number().int().positive()
});
const read = find.merge(
	z.object({
		name: z.string({}),
		username: z.string({}),
		nickname: z.string({}),
		avatarURL: z.string({}),
		roles: z.array(
			z.object({
				name: z.string(),
				hexColor: z.string(),
				position: z.number().int()
			})
		)
	})
);

export const UserSchema: SchemaBundle = {
	read: read.readonly(),
	find: find.readonly(),
	delete: false
};
export type UserListItem = z.infer<typeof read>;
