'use strict';
import LudantonError from './Error.js';

/**
 * Locker.
 */
class Locker {
	constructor(blacklists) {
		/**
		 * @type {Object<string, { events: Array<[string, string]> }>}
		 */
		this._blacklists = optimazeBlacklists(blacklists);

		/**
		 * @type {Array<[string, string]>}
		 */
		this._ignoreEvents = [];
	}

	lock(name) {
		const blacklist = this._blacklists[name];

		if (!blacklist) {
			throw new LudantonError(
				LudantonError.Code.CONFIG_INVALID_BLACKLIST_ENABLE,
				LudantonError.Category.LOGIC,
				name
			);
		}

		this._ignoreEvents = [
			...this._ignoreEvents.filter(eventTuple => eventTuple[1] !== name),
			...blacklist.events,
		];
	}

	unlock(name) {
		const blacklist = this._blacklists[name];

		if (!blacklist) {
			throw new LudantonError(
				LudantonError.Code.CONFIG_INVALID_BLACKLIST_DISABLE,
				LudantonError.Category.LOGIC,
				name
			);
		}

		this._ignoreEvents = this._ignoreEvents.filter(
			eventTuple => eventTuple[1] !== name
		);
	}

	isEventLocked(eventType) {
		return !!this._ignoreEvents.find(eventTuple => eventTuple[0] === eventType);
	}
}

export default Locker;


const optimazeBlacklists = (blacklists) => {
	const optimazedBlacklists = {};

	Object.keys(blacklists).forEach(name => {
		optimazedBlacklists[name] = {
			events: blacklists[name].events.map(item => [item, name]),
		};
	});

	return optimazedBlacklists;
};
