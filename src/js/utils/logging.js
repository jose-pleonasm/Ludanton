/* global logging:Object, commonkit:Object, py_logging_browserkit:Object */
'use strict';
// import logging from 'py-logging';
// import commonkit from 'py-logging/commonkit';
// import py_logging_browserkit from 'py-logging-browserkit';


const Logger = logging.getLoggerClass();
const Filter = logging.Filter;

Logger.TRACE = 15;

Logger.getLevelName = function(level) {
	var levelName = '';

	if (level === Logger.DEBUG) {
		levelName = 'DEBUG';
	} else if (level === Logger.TRACE) {
		levelName = 'TRACE';
	} else if (level === Logger.INFO) {
		levelName = 'INFO';
	} else if (level === Logger.WARNING) {
		levelName = 'WARNING';
	} else if (level === Logger.ERROR) {
		levelName = 'ERROR';
	} else if (level === Logger.CRITICAL) {
		levelName = 'CRITICAL';
	} else if (level === Logger.NOTSET) {
		levelName = 'NOTSET';
	}

	return levelName;
};

Logger.getLevelByName = function(levelName) {
	var level = '';

	if (levelName === 'DEBUG') {
		level = Logger.DEBUG;
	} else if (levelName === 'TRACE') {
		level = Logger.TRACE;
	} else if (levelName === 'INFO') {
		level = Logger.INFO;
	} else if (levelName === 'WARNING') {
		level = Logger.WARNING;
	} else if (levelName === 'ERROR') {
		level = Logger.ERROR;
	} else if (levelName === 'CRITICAL') {
		level = Logger.CRITICAL;
	} else if (levelName === 'NOTSET') {
		level = Logger.NOTSET;
	}

	return level;
};

Logger.prototype.trace = function(msg, args = null) {
	if (this.isEnabledFor(Logger.TRACE)) {
		this._log(Logger.TRACE, msg, null, { args });
	}
};


logging.LevelFilter = class LevelFilter extends Filter {
	constructor(level) {
		super();

		this._level = level;
	}

	filter(record) {
		return record.levelno === this._level;
	}
};

logging.ExceptLevelFilter = class ExceptLevelFilter extends Filter {
	constructor(level) {
		super();

		this._level = level;
	}

	filter(record) {
		return record.levelno !== this._level;
	}
};


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
		trace: {
			class: 'logging.StylishConsoleFormatter',
			format: '%(name)s%(message)s%(args)o',
			styles: {
				name: {
					'*': {
						'padding': '1px 5px;',
						'background-color': '#333;',
						'color': '#fff;',
						'border-radius': '4px;',
					},
				},
				message: {
					'^#.+': {
						'padding': '1px 5px;',
						'background-color': '#FF9009;',
						'color': '#fff;',
						'border-radius': '4px;',
					},
					'^@.+': {
						'padding': '1px 5px;',
						'background-color': '#ff5700;',
						'color': '#fff;',
						'border-radius': '4px;',
					},
				},
			},
		},
	},
	filters: {
		trace: {
			class: 'logging.LevelFilter',
			level: 'TRACE',
		},
		trace_less: {
			class: 'logging.ExceptLevelFilter',
			level: 'TRACE',
		},
	},
	handlers: {
		console: {
			class: 'logging.ConsoleHandler',
			level: 'DEBUG',
			grouping: false,
			formatter: 'stylish',
			filters: ['trace_less'],
		},
		console_trace: {
			class: 'logging.ConsoleHandler',
			level: 'TRACE',
			grouping: false,
			formatter: 'trace',
			filters: ['trace'],
		},
	},
	loggers: {
		'': {
			level: 'DEBUG',
			handlers: ['console', 'console_trace'],
		},
	},
});


export default logging;
