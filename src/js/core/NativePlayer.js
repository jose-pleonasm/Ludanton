'use strict';
import LudantonError from '../utils/Error.js';
import EventManager from '../utils/EventManager.js';
import { generateId } from '../utils/general.js';

/**
 * NativePlayer.
 */
class NativePlayer {
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
	 * @param  {Function} eventHandler
	 */
	constructor(element, eventHandler) {
		/**
		 * @type {HTMLVideoElement}
		 */
		this._element = element;

		/**
		 * @type {Function}
		 */
		this._emit = eventHandler;

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
			['volumechange', this._transferEvent],
			['durationchange', this._transferEvent],
			['loadedmetadata', this._transferEvent],
			['loadeddata', this._transferEvent],
			['loadstart', this._transferEvent],
			['loadend', this._transferEvent],
			['progress', this._transferEvent],
			['canplay', this._transferEvent],
			['canplaythrough', this._transferEvent],
			['play', this._transferEvent],
			['playing', this._handlePlaying],
			['pause', this._transferEvent],
			['timeupdate', this._transferEvent],
			['seeking', this._transferEvent],
			['seeked', this._transferEvent],
			['emptied', this._transferEvent],
			['stalled', this._transferEvent],
			['suspend', this._transferEvent],
			['waiting', this._transferEvent],
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
	}

	/**
	 * Destructor.
	 *
	 * After destruction, a NativePlayer instance cannot be used again.
	 */
	destroy() {
		this._rejectPlayPromise();
		this._eventManager.destroy();
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
	 * @return {TimeRanges}
	 */
	getBuffered() {
		return this._element.buffered;
	}

	/**
	 * @return {TimeRanges}
	 */
	getPlayed() {
		return this._element.played;
	}

	/**
	 * @return {number}
	 */
	getPlaybackRate() {
		return this._element.playbackRate;
	}

	/**
	 * @return {(VideoPlaybackQuality|null)}
	 */
	getVideoPlaybackQuality() {
		const hasMethod = typeof this._element.getVideoPlaybackQuality === 'function';
		return hasMethod ? this._element.getVideoPlaybackQuality() : null;
	}

	/**
	 * @return {string}
	 */
	getPoster() {
		return this._element.poster;
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
	isAutoplay() {
		return this._element.autoplay;
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

	/**
	 * @return {boolean}
	 */
	isSeeking() {
		return this._element.seeking;
	}

	/**
	 * @return {boolean}
	 */
	isEnded() {
		return this._element.ended;
	}

	/**
	 * @param  {Source} source
	 * @return {string} @see
	 * 	{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType#Return_value}
	 */
	canPlaySource(source) {
		return this._element.canPlayType(source.type);
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

		this._element.src = source.src;
	}

	/**
	 * @param {Source} source
	 */
	setSourceWithoutInterruption(source) {
		if (this._logger) {
			this._logger.trace('#setSourceWithoutInterruption', [source]);
		}

		this._source = source;
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

		this._source = null;

		this._element.removeAttribute('src');
		try {
			this.load();
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
	 * @param {number} time
	 */
	fastSeek(time) {
		if (this._logger) {
			this._logger.trace('#fastSeek', [time]);
		}

		if (typeof this._element.fastSeek === 'function') {
			this._element.fastSeek(time);
		} else {
			this._element.currentTime = time;
		}
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
	 * @param  {*} [data]
	 */
	_transferEvent(event, data) {
		if (this._logger) {
			this._logger.trace(`@${event.type}`, event);
		}

		this._emit(event.type, data);
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
		this._transferEvent(event);
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

		const error = new LudantonError(
			LudantonError.Code.SOURCE_MEDIA,
			LudantonError.Category.MEDIA,
			this._source,
			this._element.currentSrc,
			mediaError,
		);

		this._transferEvent(event, error);
	}
}

NativePlayer._video = null;

export default NativePlayer;
