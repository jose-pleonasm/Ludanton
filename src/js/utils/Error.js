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
 * @enum {string}
 */
LudantonError.Code = Object.freeze({
	/**
	 * {string} error.data[0] URI
	 * {string} error.data[1] HTTP status
	 */
	'HTTP_STATUS_BAD': 'HTTP_STATUS_BAD',

	/**
	 * {(MediaUrl|MediaObject|Array<MediaObject>)} error.data[0] source
	 */
	'SOURCE_UNSUPPORTED': 'SOURCE_UNSUPPORTED',
});

/**
 * @enum {string}
 */
LudantonError.Category = Object.freeze({
	/** Miscellaneous errors. */
	'GENERAL': 'GENERAL',

	/** Input errors. */
	'INPUT': 'INPUT',
});


export default LudantonError;
