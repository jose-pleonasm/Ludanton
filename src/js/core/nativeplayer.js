'use strict';
import LudantonError from './utils/error.js';
import EventTarget from './utils/eventtarget.js';

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
	}

	setSource(source) {
		this._source = source;
		this._element.src = source.src;
	}

	load() {
		this._element.load();
	}

	resetSource() {
		this._source = null;
		this._element.removeAttribute('src');
		try {
			this._element.load();
		}
		catch (error) {}
	}

	reset() {
		this.resetSource();
	}
}

export default NativePlayer;
