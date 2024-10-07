export const START_OF_TIME = new Date(0);
export const END_OF_TIME = new Date(8640000000000000);

export function isStartOfTime(date: Date) {
	return date.getTime() <= START_OF_TIME.getTime();
}
