
class LudantonError extends Error {
	constructor(category, code, ...context) {
		category = category || 'UNKNOWN';
		code = code || 'UNKNOWN';

		super(`${category}__${code}`);

		this.category = category;
		this.code = code;
		this.context = context;
	}

	toString() {
		return `LudantonError: ${JSON.stringify(this, null, '  ')}`;
	}
}

LudantonError.CATEGORY = {
	/** Miscellaneous errors. */
	'GENERAL': 'GENERAL',
};

LudantonError.CODE = {
	/**
	 * {string} error.context[0] URI
	 * {string} error.context[1] HTTP status
	 */
	'BAD_HTTP_STATUS': 'BAD_HTTP_STATUS',
};

export default LudantonError;
