'use strict';
import logging from 'py-logging';
import commonkit from 'py-logging/commonkit';
import browserkit from 'py-logging-browserkit';


commonkit.install(logging);
browserkit.install(logging);

logging.config({
	version: 1,
	formatters: {
		simple: {
			format: '%(message)',
		},
		verbose: {
			format: '%(asctime); %(levelname); %(name); %(message)',
		},
		stylish: {
			class: 'logging.StylishConsoleFormatter',
			format: '%(name)-14s %(message)O %(args)O'
		},
	},
	handlers: {
		console: {
			class: 'logging.ConsoleHandler',
			formatter: 'stylish',
			level: 'DEBUG',
			grouping: false,
		},
	},
	loggers: {
		'': {
			level: 'DEBUG',
			handlers: ['console'],
		},
	},
});


export default logging;
