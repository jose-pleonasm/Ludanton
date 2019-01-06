
export const debugPlaybackState = (element) => {
	console.debug(element.src);
	console.debug(element.getElementsByTagName('source'));
	console.debug(element.currentSrc);
	console.debug('paused:', element.paused);
	console.debug('played:', element.played);
};
