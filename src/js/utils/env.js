
/**
 * @typedef {Object} Resolution
 * @property {number} width
 * @property {number} height
 */

/**
 * @namespace Env
 */
export default {
	/**
	 * @function getScreenResolution
	 * @memberof Env
	 * @return {Resolution} Width and height of the screen.
	 */
	getScreenResolution() {
		if (typeof window === 'undefined') {
			return { width: NaN, height: NaN };
		}

		let ratio = window.devicePixelRatio || 1;
		let width = Math.max(window.screen.width, window.screen.height);
		let height = Math.min(window.screen.width, window.screen.height);

		return {
			width: width * ratio,
			height: height * ratio,
		};
	}
};
