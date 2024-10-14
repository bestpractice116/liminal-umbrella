 
import * as z from 'zod';

export interface SchemaBundle {
    create?: z.ZodReadonly<z.ZodTypeAny>;
    update?: z.ZodReadonly<z.ZodTypeAny>;
    delete: boolean;
    find?: z.ZodReadonly<z.ZodTypeAny>;
    read: z.ZodReadonly<z.ZodTypeAny>;
}
