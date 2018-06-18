/* global logging:Object, commonkit:Object, py_logging_browserkit:Object */
'use strict';
// import logging from 'py-logging';
// import commonkit from 'py-logging/commonkit';
// import py_logging_browserkit from 'py-logging-browserkit';


commonkit.install(logging);
py_logging_browserkit.install(logging);

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
			format: '%(name)-14s %(message)o %(args)O'
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
