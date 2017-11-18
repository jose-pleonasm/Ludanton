
/**
 * EventTarget.
 */
class LudantonEventTarget {
	constructor() {
		/**
		 * @private
		 * @type {Object}
		 */
		this._listeners = {};
	}

	/**
	 * @param {string}   type
	 * @param {(Function|EventListener)} callback
	 * @param {(Object|boolean)}   [options]
	 */
	addEventListener(type, callback, options = false) {
		if (callback === null) {
			return;
		}
		if (typeof callback !== 'function' && typeof callback !== 'object') {
			throw new TypeError(
				'Argument 2 of LudantonEventTarget.addEventListener'
				+ ' is not a function.'
			);
		}

		const opts = getOptions(options);

		if (!this._listeners[type]) {
			this._listeners[type] = [];
		}
		this._listeners[type].push({ callback, opts });
	}

	/**
	 * @param {string}   type
	 * @param {(Function|EventListener)} callback
	 * @param {(Object|boolean)}   [options]
	 */
	removeEventListener(type, callback, options = false) {
		if (callback === null) {
			return;
		}
		if (typeof callback !== 'function' && typeof callback !== 'object') {
			throw new TypeError(
				'Argument 2 of LudantonEventTarget.removeEventListener'
				+ ' is not a function.'
			);
		}

		const opts = getOptions(options);
		const listeners = this._listeners[type];

		if (!listeners) {
			return;
		}

		for (let i = listeners.length - 1; i >= 0; i--) {
			if (listeners[i].callback === callback
				&& listeners[i].opts.capture === opts.capture) {
				listeners.splice(i, 1);

				if (!listeners.length) {
					delete this._listeners[type];
				}

				return;
			}
		}
	}

	/**
	 * @param  {Event} event
	 * @return {boolean}
	 */
	dispatchEvent(event) {
		if (!event || typeof event.type !== 'string') {
			throw new TypeError(
				'Argument 1 of LudantonEventTarget.dispatchEvent'
				+ ' does not implement interface Event.');
		}

		const listeners = this._listeners[event.type];
		let stopImmediatePropagation = false;

		Object.defineProperties(event, {
			target: {
				value: this,
				enumerable: true,
				configurable: true,
			},
			cancelable: {
				value: true,
				enumerable: true,
				configurable: true,
			},
			defaultPrevented: {
				value: false,
				enumerable: true,
				configurable: true,
			},
		});
		event.preventDefault = () => {
			if (event.cancelable) {
				Object.defineProperty(
					event,
					'defaultPrevented',
					{ value: true }
				);
			}
		};
		event.stopImmediatePropagation = () => {
			stopImmediatePropagation = true;
		};

		if (!listeners) {
			return true;
		}

		for (let i = 0; i < listeners.length; i++) {
			if (stopImmediatePropagation) {
				break;
			}

			const listener = listeners[i];

			if (typeof listener.callback === 'function') {
				listener.callback.call(event.target, event);
			} else {
				listener.callback.handleEvent(event);
			}

			if (listener.opts.once) {
				this.removeEventListener(
					event.type,
					listener.callback,
					listener.opts
				);
				i--;
			}
		}

		return !event.defaultPrevented;
	}
}

export default LudantonEventTarget;

function getOptions(options) {
	let capture = false;
	let once = false;
	let passive = false;

	if (options === true) {
		capture = true;
	} else if (options) {
		if (typeof options.capture !== 'undefined') {
			capture = !!options.capture;
		}
		if (typeof options.once !== 'undefined') {
			once = !!options.once;
		}
		if (typeof options.passive !== 'undefined') {
			passive = !!options.passive;
		}
	}

	return {
		capture,
		once,
		passive,
	};
}
