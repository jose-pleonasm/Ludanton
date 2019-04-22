'use strict';

(function (logging, commonkit, browserkit) {
	'use strict';
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


	logging.getLoggerByClass = function(klass) {
		return logging.getLogger(klass.constructor.name);
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

	logging.ChannelRemover = class ChannelRemover extends Filter {
		filter(record) {
			var parts = record.name.split('.');

			record.name = parts.splice(1).join('.');
			return true;
		}
	};


	commonkit.install(logging);
	browserkit.install(logging);


	logging.StylishConsoleFormatter.prototype._processItem = function(
		data, record, match, key, flag, width, precision, type
	) {
		var ua = typeof window === 'object' && window
			&& window.navigator && window.navigator.userAgent;
		var isIE = ua && (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1);
		var pureValue = record[key];
		var directive = this._getDirective(
			match,
			key,
			flag,
			width,
			precision,
			type
		);
		var value = this._getValue(
			record,
			key,
			flag,
			width,
			precision,
			type
		);
		function getStyleByRE(key, pureValue) {
			var styleREs = this._styles[key]
				? Object.keys(this._styles[key])
				: [];

			for (var i = 0; i < styleREs.length; i++) {
				var styleRE = styleREs[i];
				try {
					if (!styleRE) {
						continue;
					}

					if (pureValue.search(styleRE) > -1) {
						return this._styles[key][styleRE];
					}
				}
				catch (error) {
					continue;
				}
			}
		}
		var style = (
			this._styles[key]
			&& (this._styles[key][pureValue] || this._styles[key]['*'])
		) || getStyleByRE.call(this, key, pureValue);
		var styling = !isIE && style
			? this._getStyling(key, pureValue, style)
			: '';

		if (styling) {
			directive = '%c' + directive;
			data.push(styling);
		}
		data.push(value);
		if (styling) {
			directive = directive + '%c';
			data.push('');
		}

		return directive;
	};


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
				format: '%(levelname)-10s %(name)-20s %(message)s\t%(args)O',
				styles: {
					...logging.StylishConsoleFormatter.COLORED_LEVELNAME
				},
			},
			trace: {
				class: 'logging.StylishConsoleFormatter',
				format: '%(name)s %(message)s %(args)O',
				styles: {
					...logging.StylishConsoleFormatter.COLORED_BG_NAME,
					message: {
						'^#.+': {
							'padding': '1px 2px;',
							// 'background-color': '#FF9009;',
							'background-color': '#4eb980;',
							'color': '#fff;',
							'border-radius': '4px;',
						},
						'^@.+': {
							'padding': '1px 2px;',
							'background-color': '#cb2027;',
							'color': '#fff;',
							'border-radius': '4px;',
						},
					},
				},
				colors: logging.StylishConsoleFormatter.TIGHT_PALLETE,
			},
		},
		filters: {
			trace_only: {
				class: 'logging.LevelFilter',
				level: 'TRACE',
			},
			trace_less: {
				class: 'logging.ExceptLevelFilter',
				level: 'TRACE',
			},
			remove_channel: {
				class: 'logging.ChannelRemover',
			},
		},
		handlers: {
			'main:console': {
				class: 'logging.ConsoleHandler',
				level: 'DEBUG',
				grouping: false,
				formatter: 'stylish',
				filters: ['trace_less', 'remove_channel'],
			},
			'main:console_trace': {
				class: 'logging.ConsoleHandler',
				level: 'TRACE',
				grouping: false,
				formatter: 'trace',
				filters: ['trace_only', 'remove_channel'],
			},
		},
		loggers: {
			'': {
				handlers: [],
			},
			'channel:main': {
				level: 'DEBUG',
				handlers: ['main:console', 'main:console_trace'],
			},
		},
	});

}(logging, logging_commonkit, logging_browserkit));
