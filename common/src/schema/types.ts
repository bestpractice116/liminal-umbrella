import * as z from 'zod';
import { RuleRender } from 'rc-field-form/es/interface.js'

export type SchemaBundle = {
  create?: z.ZodReadonly<any>,
  update?: z.ZodReadonly<any>,
  delete?: z.ZodReadonly<any>,
  read: z.ZodReadonly<any>,
}