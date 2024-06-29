import * as z from 'zod';

export type SchemaBundle = {
  create?: z.ZodReadonly<any>,
  update?: z.ZodReadonly<any>,
  delete?: z.ZodReadonly<any>,
  read: z.ZodReadonly<any>,
}
