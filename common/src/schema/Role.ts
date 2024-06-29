import * as z from 'zod';
import { SchemaBundle } from './types.js';

const read = z.object({
    name: z.string({}),
    mentionable: z.boolean(),
    key: z.coerce.number().int().positive(),
})

export const RoleSchema: SchemaBundle = {
  read: read.readonly(),
}
