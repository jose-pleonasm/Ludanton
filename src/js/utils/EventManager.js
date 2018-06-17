'use strict';

class EventManager {
	constructor(pairs, instance) {
		/**
		 * @type {Map<string:Function>}
		 */
		this._map = new Map(pairs);

		this._map.forEach((func, key) => {
			this._map.set(key, func.bind(instance));
		});
	}

	listen(subject, key) {
		subject.addEventListener(key, this._map.get(key));
	}
}

export default EventManager;
