import * as z from 'zod'
export function getSchemaKeys(schema: z.ZodObject<any>|z.ZodReadonly<any>): string[] {
    if (schema instanceof z.ZodReadonly) {
        return Object.keys(schema.unwrap().shape)
    }
    return Object.keys(schema.shape)
}