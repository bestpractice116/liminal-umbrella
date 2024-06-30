import * as z from 'zod';

export type SchemaBundle = {
  create?: z.ZodReadonly<any>,
  update?: z.ZodReadonly<any>,
  delete: boolean,
  find?: z.ZodReadonly<any>,
  read: z.ZodReadonly<any>,
}
