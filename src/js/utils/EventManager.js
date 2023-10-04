'use strict';

/**
 * EventManager.
 */
class EventManager {
	constructor(pairs) {
		/**
		 * @type {Map<string:Function>}
		 */
		this._map = new Map(pairs);

		/**
		 * @type {Object<string, Array<EventTarget>>}
		 */
		this._listening = {};
	}

	/**
	 * Destructor.
	 */
	destroy() {
		this.clear();
		this._listening = null;
		this._map = null;
	}

	/**
	 * Attaches an event listener to an event target.
	 *
	 * @param  {EventTarget} target The event target.
	 * @param  {string} type The event type.
	 */
	listen(target, type) {
		target.addEventListener(type, this._map.get(type));

		this._listening[type] = this._listening[type] || [];
		this._listening[type].push(target);
	}

	/**
	 * Detaches an event listener from an event target.
	 *
	 * @param  {EventTarget} target The event target.
	 * @param  {string} type The event type.
	 */
	unlisten(target, type) {
		this._listening[type] = this._listening[type] || [];

		for (let i = this._listening[type].length - 1; i >= 0; i--) {
			if (this._listening[type][i] === target) {
				target.removeEventListener(type, this._map.get(type));
				delete this._listening[type][i];
			}
		}
	}

	/**
	 * Detaches all event listeners from event target.
	 *
	 * @param  {EventTarget} target The event target.
	 */
	unlistenAll(target) {
		const types = Object.keys(this._listening);

		for (let i = types.length - 1; i >= 0; i--) {
			this.unlisten(target, types[i]);
		}
	}

	/**
	 * Detaches all event listeners from all targets.
	 */
	clear() {
		const types = Object.keys(this._listening);

		for (let i = types.length - 1; i >= 0; i--) {
			const type = types[i];

			if (!this._listening[type] || !this._listening[type].length) {
				continue;
			}

			for (let j = this._listening[type].length - 1; j >= 0; j--) {
				this._listening[type][j].removeEventListener(type, this._map.get(type));
			}
		}

		this._listening = {};
	}
}

export default EventManager;
