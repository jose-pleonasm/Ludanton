'use strict';
import LudantonError from '../utils/Error.js';
import EventTarget from '../utils/EventTarget.js';
import EventManager from '../utils/EventManager.js';
import logging from '../utils/logging.js';


const logger = logging.getLogger('NativePlayer');

class NativePlayer extends EventTarget {
	static _getVideo() {
		if (!NativePlayer._video) {
			NativePlayer._video = window.document.createElement('video');
		}

		return NativePlayer._video;
	}

	static canPlaySource(source) {
		return NativePlayer._getVideo().canPlayType(source.type);
	}

	constructor(element) {
		super();

		/**
		 * @type {HTMLVideoElement}
		 */
		this._element = element;

		/**
		 * @type {(Source|null)}
		 */
		this._source = null;

		/**
		 * @type {Array<[string, Function]>}
		 */
		this._eventMap = [
			['play', this._handlePlay],
			['playing', this._handlePlaying],
			['loadedmetadata', this._handleLoadedmetadata],
			['timeupdate', this._handleTimeupdate],
			['canplaythrough', this._handleCanplaythrough],
			['error', this._handleError],
		].map(
			(item) => [item[0], item[1].bind(this)],
			this,
		);

		/**
		 * @type {EventManager}
		 */
		this._eventManager = new EventManager(this._eventMap);

		this._playPromise = null;
		this._playResolve = null;
		this._playReject = null;

		this._eventManager.listen(this._element, 'error');
	}

	setSource(source) {
		logger.trace('#setSource', source);

		this._rejectPlayPromise();

		this._source = source;

		this._eventManager.listen(this._element, 'loadedmetadata');
		this._eventManager.listen(this._element, 'play');
		this._eventManager.listen(this._element, 'playing');
		this._eventManager.listen(this._element, 'timeupdate');
		this._eventManager.listen(this._element, 'canplaythrough');

		this._element.src = source.src;
	}

	resetSource() {
		logger.trace('#resetSource');

		this._rejectPlayPromise();
		this._eventManager.unlisten(this._element, 'loadedmetadata');
		this._eventManager.unlisten(this._element, 'play');
		this._eventManager.unlisten(this._element, 'playing');
		this._eventManager.unlisten(this._element, 'timeupdate');
		this._eventManager.unlisten(this._element, 'canplaythrough');

		this._source = null;

		this._element.removeAttribute('src');
		try {
			this._element.load();
		}
		catch (error) {}
	}

	load() {
		logger.trace('#load');

		this._element.load();
	}

	play() {
		logger.trace('#play');

		this._playPromise = this._element.play();

		if (!this._playPromise) {
			this._playPromise = new Promise((resolve, reject) => {
				this._playResolve = resolve;
				this._playReject = reject;
			});
		}

		return this._playPromise;
	}

	pause() {
		logger.trace('#pause');

		this._element.pause();
	}

	reset() {
		logger.trace('#reset');

		this.resetSource();
	}

	_resolvePlayPromise() {
		logger.trace('#_resolvePlayPromise');

		if (this._playResolve) {
			this._playResolve();
			this._playResolve = null;
			this._playReject = null;
		}
	}

	_rejectPlayPromise() {
		if (this._playReject) {
			this._playReject();
			this._playReject = null;
			this._playResolve = null;
		}
	}

	_handleLoadedmetadata(event) {
		logger.trace(`@${event.type}`, event);
	}

	_handlePlay(event) {
		logger.trace(`@${event.type}`, event);
	}

	_handlePlaying(event) {
		logger.trace(`@${event.type}`, event);
		this._resolvePlayPromise();
	}

	_handleTimeupdate(event) {
		logger.trace(`@${event.type}`, event);
	}

	_handleCanplaythrough(event) {
		logger.trace(`@${event.type}`, event);
	}

	_handleError(event) {
		logger.trace(event);

		const mediaError = event.target.error;

		if (mediaError.code === MediaError.MEDIA_ERR_ABORTED) {
			return;
		}
	}
}

NativePlayer._video = null;

export default NativePlayer;
