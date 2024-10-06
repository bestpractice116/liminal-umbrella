export const START_OF_TIME = new Date(0);

export function isStartOfTime(date: Date) {
	return date.getTime() <= START_OF_TIME.getTime();
}
