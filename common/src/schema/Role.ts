import * as z from 'zod';
import { createSchemaFieldRule } from 'antd-zod';
import { SchemaBundle } from './types.js';

const update = z.object({})
const formRule = createSchemaFieldRule(update)

export const RoleSchema: SchemaBundle = {
  update: update.readonly(),
  formRule,
}
