import * as z from 'zod';
import { SchemaBundle } from './types.js';

export enum ActivityType {
  Playing = 'playing',
  Steaming = 'streaming',
  Listening = 'listening',
  Watching = 'watching',
}

const create = z.object({
  name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
  }).trim().min(2, { message: "Name must be at least 2 characters long"
  }).max(100, { message: "Name must be less than 100 characters"
  }),
  type: z.nativeEnum(ActivityType),
});
const del = z.object({
  key: z.coerce.number().int().positive(),
})
const update = create.merge(del)
const read = update

export const ActivitySchema: SchemaBundle = {
  create: create.readonly(),
  update: update.readonly(),
  delete: del.readonly(),
  read: read.readonly(),
}
