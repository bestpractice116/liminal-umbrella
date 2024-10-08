export const START_OF_TIME = new Date(0);
export const END_OF_TIME = new Date('2037-01-01T00:00:00.000Z');

export function isStartOfTime(date: Date) {
	return date.getTime() <= START_OF_TIME.getTime();
}

export function isEndOfTime(date: Date) {
	return date.getTime() >= END_OF_TIME.getTime();
}
