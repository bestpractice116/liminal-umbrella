import * as z from 'zod';
import { RuleRender } from 'rc-field-form/es/interface.js'

export type SchemaBundle = {
  create: z.ZodObject<any>,
  update: z.ZodObject<any>,
  delete: z.ZodObject<any>,
  formRule: RuleRender,
}
