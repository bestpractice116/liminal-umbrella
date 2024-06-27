import * as z from 'zod';
import { createSchemaFieldRule } from 'antd-zod';
import { SchemaBundle } from './types.js';

const create = z.object({
  name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
  }).trim().min(2, { message: "Name must be at least 2 characters long"
  }).max(100, { message: "Name must be less than 100 characters"
  }),
  value: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
    }).trim().min(2, { message: "Value must be at least 2 characters long"
    }).max(1000, { message: "Value must be less than 1000 characters"
    }),
});
const del = z.object({
  key: z.coerce.number().int().positive(),
})
const update = create.merge(del)
const formRule = createSchemaFieldRule(update)

export const BotMessageSchema: SchemaBundle = {
  create,
  update,
  delete: del,
  formRule,
}
