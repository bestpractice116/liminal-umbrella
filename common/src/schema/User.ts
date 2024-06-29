import * as z from 'zod';
import { SchemaBundle } from './types.js';

const read = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }).trim().min(2, { message: "Name must be at least 2 characters long"
    }).max(100, { message: "Name must be less than 100 characters"
    }),
    key: z.coerce.number().int().positive(),
})

export const UserSchema: SchemaBundle = {
  read: read.readonly(),
}
