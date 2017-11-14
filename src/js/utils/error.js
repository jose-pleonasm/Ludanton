
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

		super(`${category}:${code}`);

		this.category = category;
		this.code = code;
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
LudantonError.Code = {
	/**
	 * {string} error.data[0] URI
	 * {string} error.data[1] HTTP status
	 */
	'BAD_HTTP_STATUS': 'BAD_HTTP_STATUS',
};

/**
 * @enum {string}
 */
LudantonError.Category = {
	/** Miscellaneous errors. */
	'GENERAL': 'GENERAL',
};

export default LudantonError;