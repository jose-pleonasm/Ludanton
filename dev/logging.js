'use strict';

(function (logging, commonkit, browserkit) {
	'use strict';

	logging.getLoggerByClass = function(klass) {
		return logging.getLogger(klass.constructor.name);
	};

	logging.ChannelRemover = class ChannelRemover extends logging.Filter {
		filter(record) {
			var parts = record.name.split('.');

			record.name = parts.splice(1).join('.');
			return true;
		}
	};

	logging.ArgsFilter = class ArgsFilter extends logging.Filter {
		filter(record) {
			const isMethodCall = record.message.indexOf('#') === 0;
			const isEventFire = record.message.indexOf('@') === 0;

			if (isMethodCall) {
				record.args = record.error;
				delete record.error;
			}
			if (isEventFire) {
				record.args = record.error;
				delete record.error;
			}

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
			rich: {
				class: 'logging.StylishConsoleFormatter',
				format: '%(levelname)-10s %(name)-20s %(message)s\t%(args)O',
				styles: {
					...logging.StylishConsoleFormatter.COLORED_LEVELNAME
				},
			},
			stylish: {
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
			remove_channel: {
				class: 'logging.ChannelRemover',
			},
			record_args: {
				class: 'logging.ArgsFilter',
			},
		},
		handlers: {
			'main:console': {
				class: 'logging.ConsoleHandler',
				level: 'DEBUG',
				grouping: false,
				formatter: 'stylish',
				filters: ['remove_channel'],
			},
		},
		loggers: {
			'': {
				handlers: [],
			},
			'channel:main': {
				level: 'DEBUG',
				handlers: ['main:console'],
			},
		},
	});

	const argsFilter = new logging.ArgsFilter();
	logging.getLogger('channel:main')._handlers[0].addFilter(argsFilter);

}(logging, logging_commonkit, logging_browserkit));
