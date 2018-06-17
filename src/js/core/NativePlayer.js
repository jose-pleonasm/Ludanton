'use strict';
import LudantonError from '../utils/Error.js';
import EventTarget from '../utils/EventTarget.js';
import EventManager from '../utils/EventManager.js';
import logging from '../utils/logging.js';


const logger = logging.getLogger('NativePlayer');

class NativePlayer extends EventTarget {
	constructor(element) {
		super();

		/**
		 * @type {HTMLVideoElement}
		 */
		this._element = element;

		/**
		 * @type {Source}
		 */
		this._source = null;

		/**
		 * @type {EventManager}
		 */
		this._eventManager = new EventManager([
			['play', this._handlePlay],
			['playing', this._handlePlaying],
			['loadedmetadata', this._handleLoadedmetadata],
			['timeupdate', this._handleTimeupdate],
			['canplaythrough', this._handleCanplaythrough],
			['error', this._handleError],
		], this);

		this._playPromise = null;
		this._playResolve = null;
		this._playReject = null;

		this._eventManager.listen(this._element, 'error');
	}

	setSource(source) {
		this._rejectPlayPromise();

		this._source = source;
		this._element.src = source.src;
		this._eventManager.listen(this._element, 'loadedmetadata');
		this._eventManager.listen(this._element, 'play');
		this._eventManager.listen(this._element, 'playing');
		this._eventManager.listen(this._element, 'timeupdate');
		this._eventManager.listen(this._element, 'canplaythrough');
	}

	resetSource() {
		this._source = null;
		this._rejectPlayPromise();
		this._element.removeAttribute('src');
		try {
			this._element.load();
		}
		catch (error) {}
	}

	load() {
		this._element.load();
	}

	play() {
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
		this._element.pause();
	}

	reset() {
		this.resetSource();
	}

	_resolvePlayPromise() {
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

	_handleReadystatechange(event) {
		console.debug(event);
	}

	_handleLoadedmetadata(event) {
		console.debug(event);
	}

	_handlePlay(event) {
		console.debug(event);
	}

	_handlePlaying(event) {
		console.debug(event);
		this._resolvePlayPromise();
	}

	_handleTimeupdate(event) {
		logger.debug(event);
	}

	_handleCanplaythrough(event) {
		console.debug(event);
	}

	_handleError(event) {
		console.debug(event);
	}
}

export default NativePlayer;
