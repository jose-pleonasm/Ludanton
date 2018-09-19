'use strict';
import LudantonError from '../utils/Error.js';
import EventTarget from '../utils/EventTarget.js';
import EventManager from '../utils/EventManager.js';
import createEvent from '../utils/createEvent.js';
import { generateId } from '../utils/general.js';


/**
 * NativePlayer.
 */
class NativePlayer extends EventTarget {
	static _getVideo() {
		if (!NativePlayer._video) {
			NativePlayer._video = window.document.createElement('video');
		}

		return NativePlayer._video;
	}

	/**
	 * @param  {Source} source
	 * @return {string} @see
	 * 	{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType#Return_value}
	 */
	static canPlaySource(source) {
		return NativePlayer._getVideo().canPlayType(source.type);
	}

	/**
	 * @param  {HTMLVideoElement} element
	 */
	constructor(element) {
		super();

		/**
		 * @type {HTMLVideoElement}
		 */
		this._element = element;

		/**
		 * @type {string}
		 */
		this._id = generateId();

		/**
		 * @type {(Source|null)}
		 */
		this._source = null;

		/**
		 * @type {Array<Array<string, Function>>}
		 */
		this._eventMap = [
			['volumechange', this._handleVolumechange],
			['durationchange', this._handleDurationchange],
			['loadedmetadata', this._handleLoadedmetadata],
			['loadeddata', this._handleLoadeddata],
			['loadstart', this._handleLoadstart],
			['loadend', this._handleLoadend],
			['progress', this._handleProgress],
			['canplay', this._handleCanplay],
			['canplaythrough', this._handleCanplaythrough],
			['play', this._handlePlay],
			['playing', this._handlePlaying],
			['pause', this._handlePause],
			['timeupdate', this._handleTimeupdate],
			['seeking', this._handleSeeking],
			['seeked', this._handleSeeked],
			['emptied', this._handleEmptied],
			['stalled', this._handleStalled],
			['suspend', this._handleSuspend],
			['waiting', this._handleWaiting],
			['error', this._handleError],
		].map(
			(item) => [item[0], item[1].bind(this)],
			this,
		);

		/**
		 * @type {EventManager}
		 */
		this._eventManager = new EventManager(this._eventMap);

		/**
		 * @type {(Promise|null)}
		 */
		this._playPromise = null;

		/**
		 * @type {(Function|null)}
		 */
		this._playResolve = null;

		/**
		 * @type {(Function|null)}
		 */
		this._playReject = null;

		/**
		 * @type {boolean}
		 */
		this._destroyed = false;

		/**
		 * @type {(Object|null)}
		 */
		this._logger = null;


		this._eventManager.listen(this._element, 'volumechange');
		this._eventManager.listen(this._element, 'emptied');
		this._eventManager.listen(this._element, 'stalled');
		this._eventManager.listen(this._element, 'suspend');
		this._eventManager.listen(this._element, 'error');
	}

	/**
	 * Destructor.
	 *
	 * After destruction, a NativePlayer instance cannot be used again.
	 */
	destroy() {
		const event = createEvent(NativePlayer.Event.DESTROYING);
		this.dispatchEvent(event);

		this._rejectPlayPromise();
		this._eventManager.clear();
		this._destroyed = true;
		this._element = null;
	}

	toString() {
		return `[object ${this.constructor.name}#${this._id}]`;
	}

	setLogger(logger) {
		this._logger = logger;
	}

	/**
	 * Returns associated video element.
	 *
	 * @return {HTMLVideoElement}
	 */
	getElement() {
		return this._element;
	}

	/**
	 * @return {(Source|null)}
	 */
	getSource() {
		return this._source;
	}

	/**
	 * @return {string} URI
	 */
	getCurrentSrc() {
		if (!this._source) {
			return '';
		}

		return this._element.currentSrc;
	}

	/**
	 * @return {number}
	 */
	getVideoWidth() {
		return this._element.videoWidth;
	}

	/**
	 * @return {number}
	 */
	getVideoHeight() {
		return this._element.videoHeight;
	}

	/**
	 * @return {number} 0 - 1
	 */
	getVolume() {
		return this._element.volume;
	}

	/**
	 * @return {number}
	 */
	getCurrentTime() {
		return this._element.currentTime;
	}

	/**
	 * @return {number}
	 */
	getDuration() {
		return this._element.duration;
	}

	/**
	 * @return {boolean}
	 */
	isReady() {
		return true;
	}

	/**
	 * @return {boolean}
	 */
	isMuted() {
		return this._element.muted;
	}

	/**
	 * @return {boolean}
	 */
	isPaused() {
		return this._element.paused;
	}

	isSeeking() {
		return this._element.seeking;
	}

	isEnded() {
		return this._element.ended;
	}

	/**
	 * @param {Source} source
	 */
	setSource(source) {
		if (this._logger) {
			this._logger.trace('#setSource', [source]);
		}

		this._rejectPlayPromise();

		this._source = source;

		this._eventManager.listen(this._element, 'durationchange');
		this._eventManager.listen(this._element, 'loadedmetadata');
		this._eventManager.listen(this._element, 'loadeddata');
		this._eventManager.listen(this._element, 'loadstart');
		this._eventManager.listen(this._element, 'loadend');
		this._eventManager.listen(this._element, 'progress');
		this._eventManager.listen(this._element, 'canplay');
		this._eventManager.listen(this._element, 'canplaythrough');
		this._eventManager.listen(this._element, 'play');
		this._eventManager.listen(this._element, 'playing');
		this._eventManager.listen(this._element, 'pause');
		this._eventManager.listen(this._element, 'timeupdate');
		this._eventManager.listen(this._element, 'seeking');
		this._eventManager.listen(this._element, 'seeked');
		this._eventManager.listen(this._element, 'waiting');

		this._element.src = source.src;
	}

	/**
	 * Reset the source.
	 * Removes listeners, removes src attribute etc.
	 */
	resetSource() {
		if (this._logger) {
			this._logger.trace('#resetSource');
		}

		this._rejectPlayPromise();
		this._eventManager.unlisten(this._element, 'durationchange');
		this._eventManager.unlisten(this._element, 'loadedmetadata');
		this._eventManager.unlisten(this._element, 'loadeddata');
		this._eventManager.unlisten(this._element, 'loadstart');
		this._eventManager.unlisten(this._element, 'loadend');
		this._eventManager.unlisten(this._element, 'progress');
		this._eventManager.unlisten(this._element, 'canplay');
		this._eventManager.unlisten(this._element, 'canplaythrough');
		this._eventManager.unlisten(this._element, 'play');
		this._eventManager.unlisten(this._element, 'playing');
		this._eventManager.unlisten(this._element, 'pause');
		this._eventManager.unlisten(this._element, 'timeupdate');
		this._eventManager.unlisten(this._element, 'seeking');
		this._eventManager.unlisten(this._element, 'seeked');
		this._eventManager.unlisten(this._element, 'waiting');

		this._source = null;

		this._element.removeAttribute('src');
		try {
			this._element.load();
		}
		catch (error) {
			// empty
		}
	}

	/**
	 * Load.
	 */
	load() {
		if (this._logger) {
			this._logger.trace('#load');
		}

		this._element.load();
	}

	/**
	 * Play.
	 *
	 * @return {Promise}
	 */
	play() {
		if (this._logger) {
			this._logger.trace('#play');
		}

		this._playPromise = this._element.play();

		if (!this._playPromise) {
			this._playPromise = new Promise((resolve, reject) => {
				this._playResolve = resolve;
				this._playReject = reject;
			});
		}

		return this._playPromise;
	}

	/**
	 * Pause.
	 */
	pause() {
		if (this._logger) {
			this._logger.trace('#pause');
		}

		this._element.pause();
	}

	/**
	 * @param {number} level 0 - 1
	 */
	setVolume(level) {
		if (this._logger) {
			this._logger.trace('#setVolume', [level]);
		}

		this._element.volume = level;
	}

	/**
	 * @param {boolean} on
	 */
	setMute(on) {
		if (this._logger) {
			this._logger.trace('#setMute', [on]);
		}

		this._element.muted = !!on;
	}

	/**
	 * @param {number} time
	 */
	seek(time) {
		if (this._logger) {
			this._logger.trace('#seek', [time]);
		}

		this._element.currentTime = time;
	}

	/**
	 * Reset.
	 */
	reset() {
		if (this._logger) {
			this._logger.trace('#reset');
		}

		this.resetSource();
	}

	_resolvePlayPromise() {
		if (this._logger) {
			this._logger.trace('#_resolvePlayPromise');
		}

		if (this._playResolve) {
			this._playResolve();
			this._playResolve = null;
			this._playReject = null;
		}
	}

	_rejectPlayPromise() {
		if (this._logger) {
			this._logger.trace('#_rejectPlayPromise');
		}

		if (this._playReject) {
			this._playReject();
			this._playReject = null;
			this._playResolve = null;
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleVolumechange(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}

		const e = createEvent(NativePlayer.Event.VOLUMECHANGE, {
			muted: this.isMuted(),
			level: this.getVolume(),
		});
		this.dispatchEvent(e);
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleDurationchange(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}

		const e = createEvent(NativePlayer.Event.DURATIONCHANGE, {
			duration: this.getDuration(),
		});
		this.dispatchEvent(e);
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleLoadedmetadata(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleLoadeddata(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleLoadstart(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleLoadend(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleProgress(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleCanplay(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleCanplaythrough(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handlePlay(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}

		const e = createEvent(NativePlayer.Event.PLAY, {
			time: this.getCurrentTime(),
		});
		this.dispatchEvent(e);
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handlePlaying(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
		this._resolvePlayPromise();

		const e = createEvent(NativePlayer.Event.PLAYING, {
			time: this.getCurrentTime(),
		});
		this.dispatchEvent(e);
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handlePause(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleTimeupdate(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleSeeking(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleSeeked(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleEmptied(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleStalled(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleSuspend(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * @private
	 * @param  {Event} event
	 */
	_handleWaiting(event) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}
	}

	/**
	 * Handles error event.
	 *
	 * @param  {Event} event
	 */
	_handleError(event) {
		if (this._logger) {
			this._logger.trace('#_handleError', [event]);
		}

		const mediaError = event.target.error;

		if (mediaError.code === MediaError.MEDIA_ERR_ABORTED) {
			return;
		}

		this._dispatchError(new LudantonError(
			LudantonError.Code.SOURCE_MEDIA,
			LudantonError.Category.MEDIA,
			this._source,
			this._element.currentSrc,
			mediaError,
		));
	}

	/**
	 * @param  {Error} error
	 */
	_dispatchError(error) {
		const event = createEvent(NativePlayer.Event.ERROR, error);

		this.dispatchEvent(event);
		return event;
	}
}

NativePlayer.Event = Object.freeze({
	VOLUMECHANGE: 'volumechange',
	DURATIONCHANGE: 'durationchange',
	LOADEDMETADATA: 'loadedmetadata',
	LOADEDDATA: 'loadeddata',
	LOADSTART: 'loadstart',
	LOADEND: 'loadend',
	PROGRESS: 'progress',
	CANPLAY: 'canplay',
	canplaythrough: 'canplaythrough',
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
	ERROR: 'error',
	DESTROYING: 'destroying',
});

NativePlayer._video = null;

export default NativePlayer;
