'use strict';
import { RESOLUTION_FACTOR } from './settings.js';
import LudantonError from './utils/Error.js';
import EventTarget from './utils/EventTarget.js';
import env from './utils/env.js';
import createSource from './utils/createSource.js';
import createEvent from './utils/createEvent.js';
import EventManager from './utils/EventManager.js';
import NativePlayer from './core/NativePlayer.js';
import logging from './utils/logging.js';


const logger = logging.getLogger('channel:main.Player');

/**
 * Player
 */
class Player extends EventTarget {
	/**
	 * @param  {HTMLVideoElement} element
	 */
	constructor(element) {
		super();
		this._source = null;

		this._corePlayer = new NativePlayer(element);

		this._options = {
			screenResolution: env.getScreenResolution(),
		};

		/**
		 * @type {Array<Array<string, Function>>}
		 */
		this._eventMap = [
			[NativePlayer.Event.VOLUME_CHANGE, this._handleEvent],
		].map(
			(item) => [item[0], item[1].bind(this)],
			this,
		);

		/**
		 * @type {EventManager}
		 */
		this._eventManager = new EventManager(this._eventMap);

		this._corePlayer.setLogger(
			logging.getLogger('channel:main.NativePlayer')
		);
		this._eventManager.listen(this._corePlayer, NativePlayer.Event.VOLUME_CHANGE);
	}

	/**
	 * Set the source.
	 * @param {(MediaUrl|MediaObject|Array<MediaObject>)} src
	 */
	setSource(src) {
		logger.trace('#setSource', [src]);
		const source = createSource(src);
		const optimalSource = this._getOptimalSource(source);

		if (!optimalSource) {
			throw new LudantonError(
				LudantonError.Code.SOURCE_UNSUPPORTED,
				LudantonError.Category.INPUT,
				src,
			);
		}

		this._corePlayer.setSource(optimalSource);
	}

	/**
	 * Starts playback of the source.
	 */
	play() {
		logger.trace('#play');
		this._corePlayer.play();
	}

	/**
	 * Pauses playback of the source.
	 */
	pause() {
		logger.trace('#pause');
		this._corePlayer.pause();
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

	/**
	 * @private
	 * @param  {CustomEvent} event
	 */
	_handleEvent(event) {
		logger.trace('#_handleEvent', [event]);
	}

	_dispatchError(error) {
		const event = createEvent(NativePlayer.Event.ERROR, error);

		this.dispatchEvent(event);

		return event;
	}
}

/**
 * @alias Player.Event
 * @readonly
 * @enum {string}
 */
const EVENT = {
	/**
	 * @event Player#error
	 * @type {CustomEvent}
	 * @property {LudantonError} detail Error
	 */
	'ERROR': 'error',
};

Player.Event = Object.freeze(EVENT);


export default Player;
