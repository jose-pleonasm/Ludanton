'use strict';
import {
	RESOLUTION_FACTOR, GET_CURRENT_SRC_TIMEOUT, GET_CURRENT_SRC_INTERVAL,
} from './settings.js';
import LudantonError from './utils/Error.js';
import EventTarget from './utils/EventTarget.js';
import { getTypeByFilename, generateId } from './utils/general.js';
import { getSourceByResolution } from './utils/source.js';
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
		 * @type {string}
		 */
		this._id = element.id || generateId();

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

		if (this._src && !this._corePlayer.getSource()) {
			// TODO: wait for source ready
		}
		this._corePlayer.pause();
		this._corePlayer.destroy();
		this._corePlayer = null;
		this._src = null;
	}

	/**
	 * @return {string}
	 */
	toString() {
		return `[object ${this.constructor.name}#${this._id}]`;
	}

	/**
	 * Returns associated video element.
	 *
	 * @return {HTMLVideoElement}
	 */
	getElement() {
		return this._corePlayer.getElement();
	}

	/**
	 * Returns the source.
	 *
	 * @return {(null|MediaUrl|MediaObject|Array<MediaObject>)}
	 */
	getSource() {
		return this._src;
	}

	/**
	 * Returns current source.
	 *
	 * @return {(null|MediaObject)}
	 */
	getCurrentSource() {
		return this._corePlayer.getSource();
	}

	/**
	 * @return {number}
	 */
	getVideoWidth() {
		return this._corePlayer.getVideoWidth();
	}

	/**
	 * @return {number}
	 */
	getVideoHeight() {
		return this._corePlayer.getVideoHeight();
	}

	/**
	 * @return {number} 0 - 1
	 */
	getVolume() {
		return this._corePlayer.getVolume();
	}

	/**
	 * @return {number}
	 */
	getCurrentTime() {
		return this._corePlayer.getCurrentTime();
	}

	/**
	 * @return {number}
	 */
	getDuration() {
		return this._corePlayer.getDuration();
	}

	/**
	 * @return {number}
	 */
	getPlaybackRate() {
		return this._corePlayer.getPlaybackRate();
	}

	/**
	 * @return {(VideoPlaybackQuality|null)}
	 */
	getVideoPlaybackQuality() {
		return this._corePlayer.getVideoPlaybackQuality();
	}

	/**
	 * @return {string}
	 */
	getPoster() {
		return this._corePlayer.getPoster();
	}

	/**
	 * @return {boolean}
	 */
	isReady() {
		return true;
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
	 * @return {boolean}
	 */
	isSeeking() {
		return this._corePlayer.isSeeking();
	}

	/**
	 * @return {boolean}
	 */
	isEnded() {
		return this._corePlayer.isEnded();
	}

	/**
	 * @return {boolean}
	 */
	isMuted() {
		return this._corePlayer.isMuted();
	}

	/**
	 * Set the source.
	 *
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

	/**
	 * @param {number} time
	 */
	seek(time) {
		logger.trace('#seek');
		this._corePlayer.seek(time);
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
		const canPlaySource = this._corePlayer.constructor.canPlaySource;
		const probably = [];
		const maybe = [];

		for (let i = 0, len = sources.length; i < len; i++) {
			const source = sources[i];
			const canPlay = canPlaySource(source);

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
			? getSourceByResolution(
				qualities,
				this._cfg.screenResolution
			)
			: sources[0];
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

			case Player.Event.LOADEDMETADATA:
				detail.duration = this._corePlayer.getDuration();
				break;

			case Player.Event.DURATIONCHANGE:
				detail.currentTime = this._corePlayer.getCurrentTime();
				detail.duration = this._corePlayer.getDuration();
				break;

			case Player.Event.PLAY:
			case Player.Event.PLAYING:
			case Player.Event.TIMEUPDATE:
			case Player.Event.SEEKING:
			case Player.Event.SEEKED:
				detail.currentTime = this._corePlayer.getCurrentTime();
				detail.duration = this._corePlayer.getDuration();
				break;

			case Player.Event.PAUSE:
				detail.currentTime = this._corePlayer.getCurrentTime();
				detail.duration = this._corePlayer.getDuration();
				detail.ended = this._corePlayer.isEnded();
				break;

			case Player.Event.ERROR:
				this._dispatchError(data);
				return;
		}

		this.dispatchEvent(createEvent(type, detail));
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
