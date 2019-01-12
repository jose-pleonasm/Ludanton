'use strict';
import {
	RESOLUTION_FACTOR, GET_CURRENT_SRC_TIMEOUT, GET_CURRENT_SRC_INTERVAL,
} from './settings.js';
import LudantonError from './utils/Error.js';
import EventTarget from './utils/EventTarget.js';
import { getTypeByFilename } from './utils/general.js';
import env from './utils/env.js';
import createSource from './utils/createSource.js';
import createEvent from './utils/createEvent.js';
import NativePlayer from './core/NativePlayer.js';
import logging from './utils/logging.js';


/**
 * @typedef {Object} Configuration
 * @property {Resolution} screenResolution
 */

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

		this._handleEvent = this._handleEvent.bind(this);

		/**
		 * @type {(null|MediaUrl|MediaObject|Array<MediaObject>)}
		 */
		this._src = null;

		/**
		 * @type {NativePlayer}
		 */
		this._corePlayer = new NativePlayer(element, this._handleEvent);

		/**
		 * @type {Configuration}
		 */
		this._cfg = {
			screenResolution: env.getScreenResolution(),
		};

		this._corePlayer.setLogger(
			logging.getLogger('channel:main.NativePlayer')
		);

		this._init();
	}

	/**
	 * Destructor.
	 *
	 * After destruction, a NativePlayer instance cannot be used again.
	 */
	destroy() {
		const event = createEvent(Player.Event.DESTROYING);
		this.dispatchEvent(event);

		// TODO
	}

	/**
	 * Returns the source.
	 * @return {(null|MediaUrl|MediaObject|Array<MediaObject>)}
	 */
	getSource() {
		return this._src;
	}

	/**
	 * Indicates whether playback is paused.
	 *
	 * @return {boolean}
	 */
	isPaused() {
		return this._corePlayer.isPaused();
	}

	/**
	 * Set the source.
	 * @param {(MediaUrl|MediaObject|Array<MediaObject>)} src
	 */
	setSource(src) {
		logger.trace('#setSource', [src]);
		this._src = src;

		const source = createSource(src);
		const optimalSource = this._getOptimalSource(source);
		logger.info('optimal source:', optimalSource);

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

	async _init() {
		logger.trace('#init');
		const element = this._corePlayer.getElement();
		const sourceElements = element.src ? [{ src: element.src }] : Array.from(
			element.getElementsByTagName('source')
		);
		if (!sourceElements.length) {
			return;
		}

		const sources = sourceElements.map(
			({ src, type }) => ({ src, type: type || getTypeByFilename(src) })
		);
		const canSetSource = this._corePlayer.isPaused()
			&& !this._corePlayer.getPlayed().length
			&& !this._corePlayer.isAutoplay();

		if (canSetSource) {
			this.setSource(sources);

		} else {
			const source = createSource(sources);
			this._src = source;

			const currentSrc = await this._getCurrentSrc();
			const currentSource = source.find(obj => obj.src === currentSrc)
				|| { src: currentSrc, type: getTypeByFilename(currentSrc) };

			this._corePlayer.setSourceWithoutInterruption(currentSource);
		}
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

	_getCurrentSrc() {
		const getCurrentSrcWhenAvailable = (timeout, resolve, reject) => {
			const currentSrc = this._corePlayer.getCurrentSrc();
			if (currentSrc) {
				return resolve(currentSrc);
			}
			if (timeout <= 0) {
				return reject(new Error('timeout'));
			}

			setTimeout(
				() => getCurrentSrcWhenAvailable(
					timeout - GET_CURRENT_SRC_INTERVAL,
					resolve,
					reject,
				),
				GET_CURRENT_SRC_INTERVAL,
			);
		};

		return new Promise(
			(resolve, reject) => getCurrentSrcWhenAvailable(
				GET_CURRENT_SRC_TIMEOUT,
				resolve,
				reject,
			),
		);
	}

	_getBestQualitySource(sources) {
		const qualities = sources.filter(source => !!source.qualityDescriptor);

		return qualities.length
			? this._getSourceByResolution(
				qualities,
				this._cfg.screenResolution
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
	 * @param  {string} eventName
	 * @param  {*} [data]
	 */
	_handleEvent(eventName, data) {
		const type = Player.Event[eventName.toUpperCase()];
		const detail = {};

		switch (type) {
			case Player.Event.VOLUMECHANGE:
				detail.muted = this._corePlayer.isMuted();
				detail.level = this._corePlayer.getVolume();
				break;

			case Player.Event.DURATIONCHANGE:
			case Player.Event.LOADEDMETADATA:
				detail.duration = this._corePlayer.getDuration();
				break;

			case Player.Event.PLAY:
			case Player.Event.PLAYING:
			case Player.Event.TIMEUPDATE:
			case Player.Event.SEEKING:
			case Player.Event.SEEKED:
				detail.time = this._corePlayer.getCurrentTime();
				break;

			case Player.Event.PAUSE:
				detail.time = this._corePlayer.getCurrentTime();
				detail.ended = this._corePlayer.isEnded();
				break;

			case Player.Event.ERROR:
				this._dispatchError(data);
				return;
		}

		this.dispatchEvent(new CustomEvent(type, { detail }));
	}

	_dispatchError(error) {
		const event = createEvent(Player.Event.ERROR, error);

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
	VOLUMECHANGE: 'volumechange',
	DURATIONCHANGE: 'durationchange',
	LOADEDMETADATA: 'loadedmetadata',
	LOADEDDATA: 'loadeddata',
	LOADSTART: 'loadstart',
	LOADEND: 'loadend',
	PROGRESS: 'progress',
	CANPLAY: 'canplay',
	CANPLAYTHROUGH: 'canplaythrough',
	PLAY: 'play',
	PLAYING: 'playing',
	PAUSE: 'pause',
	TIMEUPDATE: 'timeupdate',
	SEEKING: 'seeking',
	SEEKED: 'seeked',
	EMPTIED: 'emptied',
	STALLED: 'stalled',
	SUSPEND: 'suspend',
	WAITING: 'waiting',
	DESTROYING: 'destroying',

	/**
	 * @event Player#error
	 * @type {CustomEvent}
	 * @property {LudantonError} detail Error
	 */
	'ERROR': 'error',
};

Player.Event = Object.freeze(EVENT);


export default Player;
