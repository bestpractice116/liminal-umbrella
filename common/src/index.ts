import * as z from 'zod'
export function getSchemaKeys(schema: z.ZodObject<any>): string[] {
    return Object.keys(schema.shape)
}