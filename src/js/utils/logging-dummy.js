'use strict';

function methodMock() {}

function log(...args) {
	console.log.apply(console, args);
}

const logger = {
	log: log,
	debug: log,
	info: log,
	warning: log,
	error: log,
	critical: log,
	trace: log,
	addHandler: methodMock,
	setLevel: methodMock,
};

logger.getChild = () => logger;

function getLogger() {
	return logger;
}

export default {
	getLogger,
};
