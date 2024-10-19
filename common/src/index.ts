/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as z from 'zod';
import dayjs from './dayjs.js';
import type { Dayjs } from './dayjs.js';

export default dayjs;

export type { Dayjs };

export function getSchemaKeys(schema: z.ZodObject<any> | z.ZodReadonly<any> | z.ZodIntersection<any, any>): string[] {
    if (schema instanceof z.ZodIntersection) {
        return [...getSchemaKeys(schema._def.left), ...getSchemaKeys(schema._def.right)];
    }
    if (schema instanceof z.ZodReadonly) {
        return getSchemaKeys(schema.unwrap());
    }
    return Object.keys(schema.shape);
}

export function getZObject<T extends z.ZodRawShape>(schema: z.ZodTypeAny): z.ZodObject<T> {
    if (schema instanceof z.ZodReadonly) {
        return getZObject(schema.unwrap());
    }
    if (schema instanceof z.ZodOptional) {
        return getZObject(schema.unwrap());
    }
    return schema as z.ZodObject<T>;
}

export function dayJsCoerce(val: unknown): Dayjs | undefined {
    if (!val) return undefined;

    if (val instanceof dayjs) {
        return val as Dayjs;
    }
    if (val instanceof Date) {
        return dayjs(val);
    }
    return dayjs(val as string);
}

export function dayJsCoerceOrUndefined(val: unknown) {
    const d = dayJsCoerce(val);
    if (d?.isValid()) return d;
    return undefined;
}

export function dateCoerce(val: unknown): Date | undefined {
    return dayJsCoerce(val)?.toDate();
}

export const zodDay: z.ZodTypeAny = z.custom<Date>((val) => {
    if (!val) return false;
    return dayjs(val).isValid();
}, 'Invalid date/time');
