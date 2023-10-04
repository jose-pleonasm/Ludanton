'use strict';

function methodMock() {}

const logger = {
	log: methodMock,
	debug: methodMock,
	info: methodMock,
	warning: methodMock,
	error: methodMock,
	critical: methodMock,
	trace: methodMock,
};

export default logger;
