'use strict';
import LudantonError from './utils/Error.js';
import EventTarget from './utils/EventTarget.js';
import env from './utils/env.js';
import createSource from './utils/createSource.js';
import NativePlayer from './core/NativePlayer.js';
import { RESOLUTION_FACTOR } from './settings.js';
import logging from './utils/logging.js';


const logger = logging.getLogger('Player');

class Player extends EventTarget {
	constructor(element) {
		super();

		this._corePlayer = new NativePlayer(element);

		this._options = {
			screenResolution: env.getScreenResolution(),
		};
	}

	setSource(src) {
		logger.trace('#setSource', [src]);
		const source = createSource(src);
		const optimalSource = this._getOptimalSource(source);

		if (!optimalSource) {
			this._dispatchError(new LudantonError(
				LudantonError.Code.SOURCE_UNSUPPORTED,
				LudantonError.Category.INPUT,
				src,
			));
			return false;
		}

		this._corePlayer.setSource(optimalSource);
	}

	play() {
		logger.trace('#play');
		this._corePlayer.play();
	}

	_getOptimalSource(sources) {
		const probably = [];
		const maybe = [];

		for (let i = 0, len = sources.length; i < len; i++) {
			const source = sources[i];
			const canPlay = this._corePlayer.constructor.canPlaySource(source);

			if (canPlay === 'probably') {
				probably.push(source);
			} else if (canPlay) {
				maybe.push(source);
			}
		}

		if (probably.length) {
			return this._getBestQualitySource(probably);
		}

		if (maybe.length) {
			return this._getBestQualitySource(maybe);
		}

		return null;
	}

	_getBestQualitySource(sources) {
		const qualities = sources.filter(source => !!source.qualityDescriptor);

		return qualities.length
			? this._getSourceByResolution(
				qualities,
				this._options.screenResolution
			)
			: sources[0];
	}

	_getSourceByResolution(sources, resolution) {
		const resSources = sources.sort((a, b) => {
			return b.qualityDescriptor.height - a.qualityDescriptor.height;
		});

		for (var i = 0, len = resSources.length; i < len; i++) {
			if (resSources[i].qualityDescriptor.height <= resolution.height) {
				return resSources[i];
			}
		}
	}

	_dispatchError(error) {
		this.dispatchEvent(new CustomEvent(Player.Event.ERROR, {
			detail: error,
		}));
	}
}

Player.Event = Object.freeze({
	/**
	 * @event Player.Event.ERROR
	 * @type {CustomEvent}
	 * @property {LudantonError} event.detail Error
	 */
	'ERROR': 'error',
});


export default Player;
