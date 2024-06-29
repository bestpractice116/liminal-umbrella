import * as z from 'zod';
import { SchemaBundle } from './types.js';

const read = z.object({
    name: z.string({}),
    username: z.string({}),
    nickname: z.string({}),
    avatarURL: z.string({}),
    key: z.coerce.number().int().positive(),
})

export const UserSchema: SchemaBundle = {
  read: read.readonly(),
}
