
/**
 * EventTarget.
 */
class LudantonEventTarget {
	constructor() {
		this._listeners = {};
	}

	/**
	 * @param {string}   type
	 * @param {Function} callback  TODO: EventListener
	 * @param {(Object|boolean)}   [options]
	 */
	addEventListener(type, callback, options = false) {
		if (callback === null) {
			return;
		}
		if (typeof callback !== 'function') {
			throw new TypeError(
				'Argument 2 of LudantonEventTarget.addEventListener'
				+ ' is not a function.'
			);
		}

		if (!this._listeners[type]) {
			this._listeners[type] = [];
		}
		this._listeners[type].push(callback);
	}

	/**
	 * @param {string}   type
	 * @param {Function} callback  TODO: EventListener
	 * @param {(Object|boolean)}   [options]
	 */
	removeEventListener(type, callback, options = false) {
		if (callback === null) {
			return;
		}
		if (typeof callback !== 'function') {
			throw new TypeError(
				'Argument 2 of LudantonEventTarget.removeEventListener'
				+ ' is not a function.'
			);
		}

		const listeners = this._listeners[type];

		if (!listeners) {
			return;
		}

		for (let i = listeners.length - 1; i >= 0; i--) {
			if (listeners[i] === callback) {
				listeners.splice(i, 1);

				if (!listeners.length) {
					delete this._listeners[type];
				}

				return;
			}
		}
	}
}

export default LudantonEventTarget;
