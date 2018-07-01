'use strict';
import { DEBUG } from '../settings.js';


/**
 * A base error class.
 *
 * @extends {Error}
 */
class LudantonError extends Error {
	/**
	 * @param  {string}    code
	 * @param  {string}    category
	 * @param  {...*}      data
	 */
	constructor(code, category = LudantonError.Category.GENERAL, ...data) {
		code = code || '';
		category = category || 'UNKNOWN';

		let verbose = '';

		if (DEBUG) {
			verbose = `: ${String(data)}`;
		}

		super(`[${category}] ${code}${verbose}`);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, LudantonError);
		}

		/**
		 * @type {string}
		 */
		this.category = category;

		/**
		 * @type {string}
		 */
		this.code = code;

		/**
		 * @type {Array<*>}
		 */
		this.data = data;
	}

	/**
	 * Returns a string representing the error.
	 *
	 * @override
	 * @return {string}
	 */
	toString() {
		return `LudantonError: ${JSON.stringify(this)}`;
	}
}

/**
 * @alias LudantonError.Category
 * @readonly
 * @enum {string}
 */
const CATEGORY = {
	/** Miscellaneous errors. */
	'GENERAL': 'GENERAL',

	/** Input errors. */
	'INPUT': 'INPUT',

	/** Errors parsing or processing audio or video streams. */
	'MEDIA': 'MEDIA',
};

LudantonError.Category = Object.freeze(CATEGORY);

/**
 * @alias LudantonError.Code
 * @readonly
 * @enum {string}
 */
const CODE = {
	/**
	 * {string} error.data[0] URI
	 * {string} error.data[1] HTTP status
	 */
	'HTTP_STATUS_BAD': 'HTTP_STATUS_BAD',

	/**
	 * {(MediaUrl|MediaObject|Array<MediaObject>)} error.data[0] source
	 */
	'SOURCE_UNSUPPORTED': 'SOURCE_UNSUPPORTED',

	/**
	 * {Source} error.data[0] source
	 * {string} error.data[1] currentSrc
	 * {Object} error.data[2] originalError
	 */
	'SOURCE_MEDIA': 'SOURCE_MEDIA',
};

LudantonError.Code = Object.freeze(CODE);


export default LudantonError;
