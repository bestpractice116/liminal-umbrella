import * as z from 'zod';
import dayjs from 'dayjs';

export function getSchemaKeys(schema: z.ZodObject<any> | z.ZodReadonly<any>): string[] {
	if (schema instanceof z.ZodReadonly) {
		return Object.keys(schema.unwrap().shape);
	}
	return Object.keys(schema.shape);
}

export function getZObject(schema: z.ZodObject<any> | z.ZodReadonly<any>): z.ZodObject<any> {
	if (schema instanceof z.ZodReadonly) {
		return schema.unwrap();
	}
	return schema;
}

export function dayJsCoerce(val: unknown) {
	if (val instanceof dayjs) {
		return (val as dayjs.Dayjs).toDate();
	}
	if (val instanceof Date) {
		return val;
	}
	return new Date(val as string);
}
