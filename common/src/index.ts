import * as z from 'zod';
import { AnyZodSchema } from 'common/schema';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getSchemaKeys(schema: z.ZodObject<any> | z.ZodReadonly<any>): string[] {
	if (schema instanceof z.ZodReadonly) {
		return Object.keys(schema.unwrap().shape);
	}
	return Object.keys(schema.shape);
}

export function getZObject(schema: AnyZodSchema): z.ZodObject<any> {
	if (schema instanceof z.ZodReadonly) {
		return getZObject(schema.unwrap());
	}
	if (schema instanceof z.ZodOptional) {
		return getZObject(schema.unwrap());
	}
	return schema;
}

export function dayJsCoerce(val: unknown) {
	if (val instanceof dayjs) {
		return val;
	}
	if (val instanceof Date) {
		return dayjs(val);
	}
	return dayjs(val as string);
}

export const zodDay = z.custom<dayjs.Dayjs>((val) => val instanceof dayjs, 'Invalid date');
