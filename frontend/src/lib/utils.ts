export function checkIsMobile(): boolean {
	let isMobile = false;

	if ('maxTouchPoints' in navigator) {
		isMobile = navigator.maxTouchPoints > 0;
	}
	return isMobile;
}
