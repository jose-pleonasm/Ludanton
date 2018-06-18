(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.logging = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * @constructor Filter
 * @param {string} [name]
 */
function Filter(name) {
	name = name || '';

	/**
	 * @private
	 * @type {string}
	 */
	this._name = name;
}

/**
 * Return the text representation of this filter.
 *
 * @return {string}
 */
Filter.prototype.toString = function() {
	return '[object Filter <' + this._name + '>]';
};

/**
 * Determine if the specified record has to be logged.
 *
 * @param  {module:py-logging.LogRecord} record
 * @return {boolean} Returns false if specified record is not supposed to be processed.
 * 	True otherwise.
 */
Filter.prototype.filter = function(record) {
	if (this._name.length === 0) {
		return true;
	} else if (this._name === record.name) {
		return true;
	} else if (record.name.indexOf(this._name) !== 0) {
		return false;
	} else {
		return record.name[this._name.length] === '.';
	}
};


module.exports = Filter;

},{}],2:[function(require,module,exports){

/**
 * A base class for loggers and handlers which allows them to share common code.
 *
 * @constructor Filterer
 */
function Filterer() {
	/**
	 * Array of set filters.
	 *
	 * @private
	 * @type {Array<Filter>}
	 */
	this._filters = [];
}

/**
 * @param {Filter} filter
 */
Filterer.prototype.addFilter = function(filter) {
	if (typeof filter !== 'object') {
		throw new Error('Argument filter is not an object.');
	}

	this._filters.push(filter);
};

/**
 * @param  {Filter} filter
 */
Filterer.prototype.removeFilter = function(filter) {
	var index = this._filters.indexOf(filter);
	if (index > -1) {
		this._filters.splice(index, 1);
	}
};

/**
 * @param  {module:py-logging.LogRecord} record
 * @return {boolean} Returns false if specified record is not supposed
 * 	to be processed. True otherwise.
 */
Filterer.prototype.filter = function(record) {
	for (var i = 0, len = this._filters.length; i < len; i++) {
		if (!this._filters[i].filter(record)) {
			return false;
		}
	}
	return true;
};


module.exports = Filterer;

},{}],3:[function(require,module,exports){
var strftime = require('./strftime');

/**
 * Default formatter.
 *
 * @constructor Formatter
 * @param {string} [format]
 * @param {string} [timeFormat]
 */
function Formatter(format, timeFormat) {
	format = format || '%(message)';
	timeFormat = timeFormat || '%Y-%m-%d %H:%M:%S';

	/**
	 * @private
	 * @type {string}
	 */
	this._format = format;

	/**
	 * @private
	 * @type {string}
	 */
	this._timeFormat = timeFormat;
}

Formatter.FORMAT_PATTERN =
// |key          |flag          |width        |precission          |type
/%\(([a-z]+)\)(?:(-\+|-|\+|0| )?([0-9]+)?(?:\.([0-9]+))?(?=s|d|f))?([s|d|f|o|O])?/g;

/**
 * Return the text representation of this formatter.
 *
 * @return {string}
 */
Formatter.prototype.toString = function() {
	return '[object Formatter <' + this._format + '>]';
};

/**
 * Return the creation time of the specified LogRecord as formatted text.
 *
 * @param  {module:py-logging.LogRecord} record
 * @return {string}
 */
Formatter.prototype.formatTime = function(record) {
	return strftime(new Date(record.created), this._timeFormat);
};

/**
 * Return the specified Error object as formatted text.
 *
 * @param  {Object} error
 * @return {string}
 */
Formatter.prototype.formatError = function(error) {
	var msg = error.toString();
	var stack = typeof error.stack === 'string' ? error.stack : '';
	var file = typeof error.fileName === 'string' ? error.fileName : '';
	var line = typeof error.lineNumber === 'string' ? error.lineNumber : '';
	var s = '';

	if (stack) {
		s = stack.indexOf(msg) > -1 ? stack : msg + '\n' + stack;
	} else {
		s = msg + (file ? ' in ' + file + ':' + line : '');
	}

	return s;
};

/**
 * Return the specified LogRecord as formatted text.
 *
 * @param  {module:py-logging.LogRecord} record
 * @return {string}
 */
Formatter.prototype.format = function(record) {
	var cb = this._getReplacement.bind(this, record);
	var s = '';

	s = this._format.replace(
		Formatter.FORMAT_PATTERN,
		cb
	);
	if (record.error) {
		record.errorText = this.formatError(record.error);
	}
	if (record.errorText) {
		s = s + '\n' + record.errorText;
	}

	return s;
};

/**
 * @private
 * @param  {module:py-logging.LogRecord} record
 * @param  {string} match
 * @param  {string} key
 * @param  {string} [flag]
 * @param  {number} [width]
 * @param  {number} [precision]
 * @param  {string} [type]
 * @return {string}
 */
Formatter.prototype._getReplacement = function(record, match, key,
                                               flag, width, precision, type) {
	flag = typeof flag !== 'undefined' ? flag : '';
	width = typeof width !== 'undefined' ? parseInt(width, 10) : NaN;
	precision = typeof precision !== 'undefined' ? parseInt(precision, 10) : NaN;
	type = typeof type !== 'undefined' ? type : '';

	if (key === 'asctime') {
		return this.formatTime(record);
	}
	if (!record[key]) {
		return '';
	}

	var r = '';

	r = record[key];
	if (type) {
		if (type === 's') {
			if (!isNaN(precision) && r.length > precision) {
				r = r.slice(0, precision);
			}

		} else if (type === 'd') {
			var number = parseInt(r, 10);
			r = String(number);

			if (precision) {
				var zeroPadding = getPadding(precision - r.length, '0');
				r = zeroPadding + r;
			}

			if (number > 0 && flag.indexOf('+') > -1) {
				r = '+' + r;
			} else if (number > 0 && flag.indexOf(' ') > -1) {
				r = ' ' + r;
			}

		} else if (type === 'f') {
			var number = parseFloat(r);
			if (!isNaN(precision)) {
				number = number.toFixed(precision);
			}
			r = String(number);
			if (number > 0 && flag.indexOf('+') > -1) {
				r = '+' + r;
			} else if (number > 0 && flag.indexOf(' ') > -1) {
				r = ' ' + r;
			}
		}

		if (!isNaN(width) && r.length < width) {
			var paddingChar = flag === '0' && type !== 's' ? '0' : ' ';
			var padding = getPadding(width - r.length, paddingChar);

			r = flag.indexOf('-') === 0 ? r + padding : padding + r;
		}
	}

	return r;
};


module.exports = Formatter;


/** @private */
var cache = {};
function getPadding(count, char) {
	char = char || ' ';

	var cacheKey = char + count;
	if (cache[cacheKey]) {
		return cache[cacheKey];
	}

	var r = (new Array(count + 1)).join(char);

	cache[cacheKey] = r;
	return r;
}
},{"./strftime":9}],4:[function(require,module,exports){
var util = require('util');
var Filterer = require('./Filterer');
var Logger = require('./Logger');

/**
 * An abstract handler.
 *
 * @constructor Handler
 * @extends Filterer
 * @param {number} [level=NOTSET]
 */
function Handler(level) {
	level = level || Logger.NOTSET;

	if (Logger.getLevelName(level) === '') {
		throw new Error('Argument 1 of Handler.constructor has unsupported'
			+ ' value \'' + level + '\'');
	}

	Filterer.call(this);

	/**
	 * @private
	 * @type {number}
	 */
	this._level = level;

	/**
	 * @private
	 * @type {Object}
	 */
	this._formatter = null;
}
util.inherits(Handler, Filterer);

/**
 * Return the text representation of this handler.
 *
 * @return {string}
 */
Handler.prototype.toString = function() {
	return '[object Handler]';
};

/**
 * Set the logging level of this handler.
 *
 * @param {number} level
 */
Handler.prototype.setLevel = function(level) {
	if (Logger.getLevelName(level) === '') {
		throw new Error('Argument 1 of Handler.setLevel has unsupported value'
			+ ' \'' + level + '\'');
	}

	this._level = level;
};

/**
 * Is this handler enabled for specified level?
 *
 * @param  {number}  level
 * @return {boolean}
 */
Handler.prototype.isEnabledFor = function(level) {
	return level >= this._level;
};

/**
 * Set the formatter for this handler.
 *
 * @param {Formatter} formatter
 */
Handler.prototype.setFormatter = function(formatter) {
	this._formatter = formatter;
};

/**
 * Format the specified record.
 *
 * @param  {module:py-logging.LogRecord} record
 * @return {string}
 */
Handler.prototype.format = function(record) {
	if (!this._formatter) {
		throw new Error('Formatter for Handler.format is not set.');
	}
	return this._formatter.format(record);
};

/**
 * Handle the specified logging record.
 *
 * @param  {module:py-logging.LogRecord} record
 * @return {module:py-logging.LogRecord}
 */
Handler.prototype.handle = function(record) {
	var rv = this.filter(record);

	if (rv) {
		this.emit(record);
	}

	return rv;
};

/**
 * Do whatever it takes to actually log the specified logging record.
 *
 * @abstract
 * @param  {module:py-logging.LogRecord} record
 */
Handler.prototype.emit = function(record) {
	throw new Error('Handler.emit is not implemented.');
};

/**
 * @abstract
 */
Handler.prototype.flush = function() {};

/**
 * @abstract
 */
Handler.prototype.close = function() {};

/**
 * Handle errors which occur during an emit() call.
 *
 * @param  {Error} error
 * @param  {module:py-logging.LogRecord} [record]
 */
Handler.prototype.handleError = function(error, record) {
	record = record || null;

	if (typeof console === 'object') {
		console.error('An error "'+ error.toString() + '" has occurred'
				+ (record
						? ' during handling the record "' + record.message + '"'
						: ''));
	}
};


module.exports = Handler;

},{"./Filterer":2,"./Logger":5,"util":13}],5:[function(require,module,exports){
(function (global){
var util = require('util');
var Filterer = require('./Filterer');

/**
 * @typedef {Object} module:py-logging.LogRecord
 * @property {number} created Time when this record was created.
 * @property {string} name Name of the logger.
 * @property {number} levelno Numeric logging level.
 * @property {string} levelname Text logging level.
 * @property {string} message The logged message.
 * @property {Object} [error] The logged error.
 * @property {Object} [extra] Extra data.
 * @property {number} [process] Process ID (if available).
 * @property {string} [processname] Process title (if available).
 */

/**
 * @constructor Logger
 * @extends Filterer
 * @param {?Logger} parent
 * @param {string} name
 * @param {number} [level=NOTSET]
 */
function Logger(parent, name, level) {
	level = level || Logger.NOTSET;

	if (Logger.getLevelName(level) === '') {
		throw new Error('Argument 3 of Logger.constructor has unsupported value'
			+ ' \'' + level + '\'');
	}

	Filterer.call(this);

	/**
	 * Parent logger.
	 *
	 * @private
	 * @type {Object}
	 */
	this._parent = parent;

	/**
	 * Name of this logger.
	 *
	 * @private
	 * @type {string}
	 */
	this._name = name;

	/**
	 * The threshold for this logger.
	 *
	 * @private
	 * @type {number}
	 */
	this._level = level;

	/**
	 * Array of set handlers.
	 *
	 * @private
	 * @type {Array}
	 */
	this._handlers = [];

	/**
	 * If this evaluates to true, events logged to this logger will be ignored.
	 *
	 * @memberof Logger.prototype
	 * @type {boolean}
	 */
	this.disabled = false;

	/**
	 * If this evaluates to true, events logged to this logger will be passed
	 * to the handlers of higher level loggers.
	 *
	 * @memberof Logger.prototype
	 * @type {boolean}
	 */
	this.propagate = true;
}
util.inherits(Logger, Filterer);

Logger.NOTSET   = 0;
Logger.DEBUG    = 10;
Logger.INFO     = 20;
Logger.WARNING  = 30;
Logger.ERROR    = 40;
Logger.CRITICAL = 50;

/**
 * Return the textual representation of logging level.
 *
 * @static
 * @param  {number} level
 * @return {string}
 */
Logger.getLevelName = function(level) {
	var levelName = '';

	if (level === Logger.DEBUG) {
		levelName = 'DEBUG';
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

/**
 * Return value of the level name.
 *
 * @static
 * @param  {string} levelName
 * @return {number}
 */
Logger.getLevelByName = function(levelName) {
	var level = '';

	if (levelName === 'DEBUG') {
		level = Logger.DEBUG;
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

/**
 * Return the text representation of this logger.
 *
 * @return {string}
 */
Logger.prototype.toString = function() {
	return '[object Logger <' + this._name + '>]';
};

/**
 * Return the name of this logger.
 *
 * @return {string}
 */
Logger.prototype.getName = function() {
	return this._name;
};

/**
 * Return the effective level for this logger.
 *
 * @return {number}
 */
Logger.prototype.getEffectiveLevel = function() {
	var logger = this;

	while (logger) {
		if (logger._level) {
			return logger._level;
		}
		logger = logger._parent;
	}

	return Logger.NOTSET;
};

/**
 * Is this logger enabled for specified level?
 *
 * @param  {number}  level
 * @return {boolean}
 */
Logger.prototype.isEnabledFor = function(level) {
	return level >= this.getEffectiveLevel();
};

/**
 * Set the logging level of this logger.
 *
 * @param {number} level
 */
Logger.prototype.setLevel = function(level) {
	if (Logger.getLevelName(level) === '') {
		throw new Error('Argument 1 of Logger.setLevel has unsupported value'
			+ ' \'' + level + '\'');
	}

	this._level = level;
};

/**
 * Add the specified handler to this logger.
 *
 * @param {Handler} handler
 */
Logger.prototype.addHandler = function(handler) {
	if (typeof handler !== 'object') {
		throw new Error('Argument 1 of Logger.addHandler is not an object.');
	}

	this._handlers.push(handler);
};

/**
 * Remove the specified handler from this logger.
 *
 * @param  {Handler} handler
 */
Logger.prototype.removeHandler = function(handler) {
	var index = this._handlers.indexOf(handler);
	if (index > -1) {
		this._handlers.splice(index, 1);
	}
};

/**
 * See if this logger has any handlers configured.
 *
 * @return {boolean}
 */
Logger.prototype.hasHandlers = function() {
	var logger = this;

	while (logger) {
		if (logger._handlers.length) {
			return true;
		}

		if (logger.propagate) {
			logger = logger._parent;
		} else {
			logger = null;
		}
	}

	return false;
};

/**
 * Log msg with severity 'DEBUG'.
 *
 * @param  {string} msg
 * @param  {Object} [error]
 * @param  {Object} [extra]
 */
Logger.prototype.debug = function(msg, error, extra) {
	error = error || null;
	extra = extra || null;

	if (this.isEnabledFor(Logger.DEBUG)) {
		this._log(Logger.DEBUG, msg, error, extra);
	}
};

/**
 * Log msg with severity 'INFO'.
 *
 * @param  {string} msg
 * @param  {Object} [error]
 * @param  {Object} [extra]
 */
Logger.prototype.info = function(msg, error, extra) {
	error = error || null;
	extra = extra || null;

	if (this.isEnabledFor(Logger.INFO)) {
		this._log(Logger.INFO, msg, error, extra);
	}
};

/**
 * Log msg with severity 'WARNING'.
 *
 * @param  {string} msg
 * @param  {Object} [error]
 * @param  {Object} [extra]
 */
Logger.prototype.warning = function(msg, error, extra) {
	error = error || null;
	extra = extra || null;

	if (this.isEnabledFor(Logger.WARNING)) {
		this._log(Logger.WARNING, msg, error, extra);
	}
};

/**
 * Log msg with severity 'ERROR'.
 *
 * @param  {string} msg
 * @param  {Object} [error]
 * @param  {Object} [extra]
 */
Logger.prototype.error = function(msg, error, extra) {
	error = error || null;
	extra = extra || null;

	if (this.isEnabledFor(Logger.ERROR)) {
		this._log(Logger.ERROR, msg, error, extra);
	}
};

/**
 * Log msg with severity 'CRITICAL'.
 *
 * @param  {string} msg
 * @param  {Object} [error]
 * @param  {Object} [extra]
 */
Logger.prototype.critical = function(msg, error, extra) {
	error = error || null;
	extra = extra || null;

	if (this.isEnabledFor(Logger.CRITICAL)) {
		this._log(Logger.CRITICAL, msg, error, extra);
	}
};

/**
 * Log msg with specified severity.
 *
 * @param  {number} level
 * @param  {string} msg
 * @param  {Object} [error]
 * @param  {Object} [extra]
 */
Logger.prototype.log = function(level, msg, error, extra) {
	error = error || null;
	extra = extra || null;

	if (this.isEnabledFor(level)) {
		this._log(level, msg, error, extra);
	}
};

/**
 * Create a LogRecord object.
 *
 * @param  {number} level
 * @param  {string} msg
 * @param  {Object} [error]
 * @param  {Object} [extra]
 * @return {module:py-logging.LogRecord}
 */
Logger.prototype.makeRecord = function(level, msg, error, extra) {
	error = error || null;
	extra = extra || null;

	var record = {
		created: Date.now(),
		name: this._name,
		levelno: level,
		levelname: Logger.getLevelName(level),
		message: msg,
	};
	if (typeof global === 'object' && global.process && global.process.pid) {
		record.process = global.process.pid;
		record.processname = global.process.title;
	}
	if (error) {
		record.error = error;
	}
	if (extra) {
		record = Object.assign(record, extra);
	}

	return record;
};

/**
 * @private
 * @param  {number} level
 * @param  {string} msg
 * @param  {Object} [error]
 * @param  {Object} [extra]
 */
Logger.prototype._log = function(level, msg, error, extra) {
	var record = this.makeRecord(level, msg, error, extra);

	if (!this.disabled && this.filter(record)) {
		this._callHandlers(record);
	}
};

/**
 * @private
 * @param  {module:py-logging.LogRecord} record
 */
Logger.prototype._callHandlers = function(record) {
	var logger = this;

	while (logger) {
		logger._handlers.forEach(function(handler) {
			if (handler.isEnabledFor(record.levelno)) {
				handler.handle(record);
			}
		});

		if (logger.propagate) {
			logger = logger._parent;
		} else {
			logger = null;
		}
	}
};


module.exports = Logger;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Filterer":2,"util":13}],6:[function(require,module,exports){
var Logger = require('./Logger');

var loggers = {};

/**
 * Manager, which holds the hierarchy of loggers.
 *
 * @private
 */
var Manager = {};

/**
 * @type {Logger}
 */
Manager.root = new Logger(null, 'root', Logger.WARNING);

/**
 * Get a logger with the specified name, creating it 
 * if it doesn't yet exist. This name is a dot-separated hierarchical 
 * name, such as "a", "a.b", "a.b.c" or similar.
 *
 * @param  {string} name
 * @return {Object}
 */
Manager.getLogger = function(name) {
	var parts = name.split('.');
	var currentName = '';
	var prevLogger = Manager.root;
	for (var i = 1, len = parts.length; i <= len; i++) {
		currentName = parts.slice(0, i).join('.');
		if (!loggers[currentName]) {
			loggers[currentName] = new Logger(prevLogger, currentName);
		}
		prevLogger = loggers[currentName];
	}

	return loggers[name];
};

/**
 *  Removes all the loggers.
 */
Manager.clear = function() {
	var names = Object.keys(loggers);
	var name = '';

	for (var i = 0, len = names.length; i < len; i++) {
		name = names[i];
		loggers[name] = null;
		delete loggers[name];
	}
	Manager.root = null;
};


module.exports = Manager;

},{"./Logger":5}],7:[function(require,module,exports){
(function (process){
var util = require('util');
var Handler = require('./Handler');


//------------------------------------------------------------------------------
//   StreamHandler
//------------------------------------------------------------------------------

/**
 * Base stream handler.
 *
 * A handler class which writes logging records, appropriately formatted,
 * to a stream. Note that this class does not close the stream, as
 * process.stdout or process.stderr may be used.
 *
 * @constructor StreamHandler
 * @extends Handler
 * @param {Object} [stream=process.stderr]
 * @param {string} [recordTextEnd=\n]
 */
function StreamHandler(stream, recordTextEnd) {
	stream = stream || null;
	recordTextEnd = typeof recordTextEnd !== 'undefined' ? recordTextEnd : '\n';

	Handler.call(this);

	if (!stream) {
		stream = process.stderr;
	}

	this._stream = stream;
	this._recordTextEnd = recordTextEnd;
}
util.inherits(StreamHandler, Handler);

/**
 * Writes the record to the stream (with a trailing newline, if default setup).
 *
 * @param  {module:py-logging.LogRecord} record
 * @return {boolean} false if the stream wishes for the calling code to wait
 * 	for the 'drain' event to be emitted before continuing to write
 * 	additional data; otherwise true.
 */
StreamHandler.prototype.emit = function(record) {
	try {
		var data = this.format(record);

		if (this._recordTextEnd && typeof data === 'string') {
			data += this._recordTextEnd;
		}

		return this._stream.write(data);
	}
	catch (err) {
		this.handleError(err, record);
	}
};


//------------------------------------------------------------------------------
//   Console handler
//------------------------------------------------------------------------------

var methodMap = {
	'DEBUG': 'debug',
	'INFO': 'info',
	'WARNING': 'warn',
	'ERROR': 'error',
	'CRITICAL': 'error',
};

/**
 * Console handler.
 *
 * @constructor ConsoleHandler
 * @extends Handler
 * @param {number} [level]
 * @param {boolean} [grouping=true]
 * @param {boolean} [collapsed=false]
 */
function ConsoleHandler(level, grouping, collapsed) {
	grouping = typeof grouping !== 'undefined' ? grouping : true;
	collapsed = typeof collapsed !== 'undefined' ? collapsed : false;

	Handler.call(this, level);

	this._grouping = grouping;
	this._groupMethod = collapsed ? 'groupCollapsed' : 'group';
	this._openGroup = '';
}
util.inherits(ConsoleHandler, Handler);

/** @inheritdoc */
ConsoleHandler.prototype.emit = function(record) {
	var consoleMethod = methodMap[record.levelname] || 'log';
	var consoleMsg = this.format(record);
	var consoleArgs = [].concat(consoleMsg);

	if (this._grouping && record.name !== this._openGroup) {
		if (this._openGroup) {
			console.groupEnd();
		}

		this._openGroup = record.name;
		console[this._groupMethod](this._openGroup);
	}

	console[consoleMethod].apply(console, consoleArgs);
};


module.exports = {
	StreamHandler: StreamHandler,
	ConsoleHandler: ConsoleHandler,
};

}).call(this,require('_process'))
},{"./Handler":4,"_process":11,"util":13}],8:[function(require,module,exports){
(function (global){
var Logger = require('./Logger');
var Filter = require('./Filter');
var Formatter = require('./Formatter');
var Handler = require('./Handler');
var handlers = require('./handlers');
var Manager = require('./Manager');


/**
 * @module py-logging
 */

var MODULE_IDENTIFIER = 'logging';
var VERSION = '2.0.0';


//------------------------------------------------------------------------------
//   Function for universal (Node & Browser) configuration. Can be overridden.
//------------------------------------------------------------------------------
/**
 * Do basic configuration for the logging system.
 *
 * @function
 * @memberof module:py-logging
 * @param  {Object} [options]
 */
function basicConfig(options) {
	options = options || {};

	var format = options.format || '%(levelname):%(name):%(message)';
	var timeFormat = options.timeFormat || '';

	var handler = null;
	var formatter = null;

	if (options.stream) {
		handler = new handlers.StreamHandler(options.stream);
	} else {
		handler = new handlers.ConsoleHandler();
	}

	formatter = new Formatter(format, timeFormat);
	handler.setFormatter(formatter);
	Manager.root.addHandler(handler);
	var level = options.level;
	if (level) {
		if (typeof level === 'string') {
			level = Logger.getLevelByName(level);
		}
		Manager.root.setLevel(level);
	}
}


//------------------------------------------------------------------------------
//   Configurator
//------------------------------------------------------------------------------

/**
 * Configurator
 *
 * @private
 * @type {Object}
 */
var Configurator = {};

Configurator.FORMAT_VERSION = 1;

Configurator.FUNCTION_SIGNATURE_PATTERN = /function[^(]*\(([^)]*)\)/;

/**
 * Configure logging using a "dict" object.
 *
 * @param  {Object} config
 * @param  {?Object} [outerContext]
 */
Configurator.configure = function(config, outerContext) {
	outerContext = outerContext || global;

	if (!config) {
		throw new Error('Argument 1 of Configurator.configure'
			+ ' is not specified.');
	}
	if (typeof config !== 'object') {
		throw new Error('Argument 1 of Configurator.configure'
			+ ' is not an object.');
	}
	if (!Configurator._isSupportedVersion(config.version)) {
		throw new Error('Config format version ' + config.version
			+ ' is not supported.');
	}

	var params = {};
	var instancies = {};

	// formatters
	params.formatters = Configurator._getSectionParams(
		config.formatters,
		outerContext,
		MODULE_IDENTIFIER + '.Formatter'
	);
	instancies.formatters = Configurator._createInstancies(
		params.formatters
	);

	// filters
	params.filters = Configurator._getSectionParams(
		config.filters,
		outerContext,
		MODULE_IDENTIFIER + '.Filter'
	);
	instancies.filters = Configurator._createInstancies(
		params.filters
	);

	// handlers
	params.handlers = Configurator._getSectionParams(
		config.handlers,
		outerContext
	);
	instancies.handlers = Configurator._createInstancies(
		params.handlers
	);
	Configurator._setComponents(
		params.handlers,
		instancies.handlers,
		instancies.formatters,
		'formatter',
		'setFormatter'
	);
	Configurator._setComponents(
		params.handlers,
		instancies.handlers,
		instancies.filters,
		'filters',
		'addFilter'
	);

	// loggers
	params.loggers = {};
	instancies.loggers = {};
	for (var identifier in config.loggers) {
		if (!config.loggers.hasOwnProperty(identifier)) {
			continue;
		}
		var descriptor = config.loggers[identifier];
		var settings = Object.assign({}, descriptor);
		var loggerName = identifier;
		var instance = null;

		delete settings.level;

		params.loggers[identifier] = {
			constructor: null,
			args: null,
			settings: settings,
		};

		instance = getLogger(loggerName);
		if (descriptor.level) {
			instance.setLevel(
				Logger.getLevelByName(descriptor.level)
			);
		}

		instancies.loggers[identifier] = instance;
	}
	Configurator._setComponents(
		params.loggers,
		instancies.loggers,
		instancies.handlers,
		'handlers',
		'addHandler'
	);
	Configurator._setComponents(
		params.loggers,
		instancies.loggers,
		instancies.filters,
		'filters',
		'addFilter'
	);
};

/**
 * @private
 * @param  {number}  version
 * @return {boolean}
 */
Configurator._isSupportedVersion = function(version) {
	return version == Configurator.FORMAT_VERSION;
};

/**
 * @private
 * @param  {Object<string, Object>} section
 * @param  {Object} outerContext
 * @param  {string} [defaultClass]
 * @return {Object<string, Object>}
 */
Configurator._getSectionParams = function(section, outerContext, defaultClass) {
	defaultClass = defaultClass || '';

	var params = {};

	for (var identifier in section) {
		if (!section.hasOwnProperty(identifier)) {
			continue;
		}
		if (!section[identifier] || typeof section[identifier] !== 'object') {
			throw new Error('Invalid format'
				+ ' in Configurator._getSectionParams.');
		}

		var descriptor = section[identifier];
		var klass = descriptor.class || defaultClass;
		var settings = Object.assign({}, descriptor);
		var constructor = (
			typeof klass === 'function'
				? klass
				: (typeof klass === 'string'
					? Configurator._getConstructor(klass, outerContext) : null)
		);
		if (!constructor) {
			throw new Error(
				'Class "' + klass + '" does not exist'
				+ ' in Configurator._getSectionParams.'
			);
		}
		var argsList = Configurator._getArgsList(constructor);
		var args = Configurator._getMatchingArgs(argsList, descriptor);

		delete settings.class;
		for (var i = 0, len = argsList.length; i < len; i++) {
			delete settings[argsList[i]];
		}

		params[identifier] = {
			constructor: constructor,
			args: args,
			settings: settings,
		};
	}

	return params;
};

/**
 * @private
 * @param  {Object<string, Object>} sectionParams
 * @return {Object<string, Object>}
 */
Configurator._createInstancies = function(sectionParams) {
	var instancies = {};

	for (var identifier in sectionParams) {
		if (!sectionParams.hasOwnProperty(identifier)) {
			continue;
		}
		var itemParams = sectionParams[identifier];
		var instance = Configurator._createInstance(
			itemParams.constructor,
			itemParams.args
		);

		if (itemParams.settings.level
			&& typeof instance.setLevel === 'function') {
			instance.setLevel(
				Logger.getLevelByName(itemParams.settings.level)
			);
		}

		instancies[identifier] = instance;
	}

	return instancies;
};

/**
 * @private
 * @param {Object<string, Object>} sectionParams
 * @param {Object<string, Object>} subjects
 * @param {Object<string, Object>} components
 * @param {string} subjectSettingsKey
 * @param {string} subjectMethodName
 */
Configurator._setComponents = function(sectionParams, subjects, components,
	subjectSettingsKey, subjectMethodName) {
	for (var identifier in sectionParams) {
		if (!sectionParams.hasOwnProperty(identifier)) {
			continue;
		}
		var itemParams = sectionParams[identifier];
		var subject = subjects[identifier];
		var componentIdentifiers = itemParams.settings[subjectSettingsKey];

		if (!componentIdentifiers) {
			continue;
		}
		if (!Array.isArray(componentIdentifiers)) {
			componentIdentifiers = [componentIdentifiers];
		}

		for (var i = 0, len = componentIdentifiers.length; i < len; i++) {
			subject[subjectMethodName](
				components[componentIdentifiers[i]]
			);
		}
	}
};

/**
 * @private
 * @param  {string} absoluteClassPath
 * @param  {Object} outerContext
 * @return {?Function}
 */
Configurator._getConstructor = function(absoluteClassPath, outerContext) {
	var isInner = absoluteClassPath.indexOf(MODULE_IDENTIFIER + '.') === 0;
	var relativeClassPath = isInner
		? absoluteClassPath.replace(MODULE_IDENTIFIER + '.', '')
		: absoluteClassPath;
	var context = isInner ? module.exports : outerContext;

	return Configurator._procureClass(relativeClassPath, context);
};

/**
 * @private
 * @param  {string} relativeClassPath
 * @param  {Object} context
 * @return {?Function}
 */
Configurator._procureClass = function(relativeClassPath, context) {
	var propertiesChain = relativeClassPath.split('.');
	var result = Configurator._getNestedProperty(context, propertiesChain);

	return typeof result === 'function' ? result : null;
};

/**
 * @private
 * @param  {Object} object
 * @param  {Array<string>} propertiesChain
 * @return {*}
 */
Configurator._getNestedProperty = function(object, propertiesChain) {
	if (!object || typeof object !== 'object') {
		return null;
	}

	var propertyName = propertiesChain.shift();
	var complete = !propertiesChain.length;
	var exists = propertyName in object;

	if (complete) {
		return exists ? object[propertyName] : null;
	}

	return exists
		? Configurator._getNestedProperty(object[propertyName], propertiesChain)
		: null;
};

/**
 * @private
 * @param  {Function} func
 * @return {Array<string>}
 */
Configurator._getArgsList = function(func) {
	var args = func.toString().match(Configurator.FUNCTION_SIGNATURE_PATTERN)[1]
		.split(/\s*,\s*/);

	return args;
};

/**
 * @private
 * @param  {Array<string>} list
 * @param  {Object<string, *>} store
 * @return {Array<*>}
 */
Configurator._getMatchingArgs = function(list, store) {
	var args = [];

	for (var i = 0, len = list.length; i < len; i++) {
		var argName = list[i];

		if (argName === 'level') {
			args[i] = Logger.getLevelByName(store[argName]);
		} else if (argName in store) {
			args[i] = store[argName];
		}
	}

	return args;
};

/**
 * @private
 * @param  {Function} constructor
 * @param  {Array<*>} args
 * @return {Object}
 */
Configurator._createInstance = function(constructor, args) {
	var bindArgs = [constructor].concat(args);

	return new (constructor.bind.apply(constructor, bindArgs));
};


//------------------------------------------------------------------------------
//   Log methods of the module
//------------------------------------------------------------------------------

/**
 * @function
 * @memberof module:py-logging
 * @see {@link Logger#debug}
 */
function debug(msg, error, extra) {
	if (!Manager.root.hasHandlers()) {
		basicConfig();
	}
	Manager.root.debug(msg, error, extra);
}

/**
 * @function
 * @memberof module:py-logging
 * @see {@link Logger#info}
 */
function info(msg, error, extra) {
	if (!Manager.root.hasHandlers()) {
		basicConfig();
	}
	Manager.root.info(msg, error, extra);
}

/**
 * @function
 * @memberof module:py-logging
 * @see {@link Logger#warning}
 */
function warning(msg, error, extra) {
	if (!Manager.root.hasHandlers()) {
		basicConfig();
	}
	Manager.root.warning(msg, error, extra);
}

/**
 * @function
 * @memberof module:py-logging
 * @see {@link Logger#error}
 */
function error(msg, error, extra) {
	if (!Manager.root.hasHandlers()) {
		basicConfig();
	}
	Manager.root.error(msg, error, extra);
}

/**
 * @function
 * @memberof module:py-logging
 * @see {@link Logger#critical}
 */
function critical(msg, error, extra) {
	if (!Manager.root.hasHandlers()) {
		basicConfig();
	}
	Manager.root.critical(msg, error, extra);
}

/**
 * @function
 * @memberof module:py-logging
 * @see {@link Logger#log}
 */
function log(level, msg, error, extra) {
	if (!Manager.root.hasHandlers()) {
		basicConfig();
	}
	Manager.root.log(level, msg, error, extra);
}


//------------------------------------------------------------------------------
//   Facade
//------------------------------------------------------------------------------

/**
 * Return the class to be used when instantiating a logger.
 *
 * @function
 * @memberof module:py-logging
 * @return {Function}
 */
function getLoggerClass() {
	return Logger;
}

/**
 * Return a logger with the specified name, creating it if necessary.
 * If no name is specified, return the root logger.
 *
 * @function
 * @memberof module:py-logging
 * @param  {string} [name]
 * @return {Logger}
 */
function getLogger(name) {
	name = name || '';

	if (!name) {
		return Manager.root;
	} else {
		return Manager.getLogger(name);
	}
}

module.exports = {
	/**
	 * @memberof module:py-logging
	 * @constant
	 * @type {string}
	 */
	MODULE_IDENTIFIER: MODULE_IDENTIFIER,

	/**
	 * @memberof module:py-logging
	 * @constant
	 * @type {string}
	 */
	VERSION: VERSION,

	/**
	 * @memberof module:py-logging
	 * @constant
	 * @type {number}
	 */
	NOTSET:   Logger.NOTSET,

	/**
	 * @memberof module:py-logging
	 * @constant
	 * @type {number}
	 */
	DEBUG:    Logger.DEBUG,

	/**
	 * @memberof module:py-logging
	 * @constant
	 * @type {number}
	 */
	INFO:     Logger.INFO,

	/**
	 * @memberof module:py-logging
	 * @constant
	 * @type {number}
	 */
	WARNING:  Logger.WARNING,

	/**
	 * @memberof module:py-logging
	 * @constant
	 * @type {number}
	 */
	ERROR:    Logger.ERROR,

	/**
	 * @memberof module:py-logging
	 * @constant
	 * @type {number}
	 */
	CRITICAL: Logger.CRITICAL,

	/**
	 * Configure logging using a "dict" object.
	 *
	 * @function
	 * @memberof module:py-logging
	 * @param  {Object} config
	 * @param  {?Object} [outerContext]
	 */
	config: Configurator.configure,

	/**
	 * Return the textual representation of logging level.
	 *
	 * @function
	 * @memberof module:py-logging
	 * @param  {number} level
	 * @return {string}
	 */
	getLevelName: Logger.getLevelName,

	getLoggerClass: getLoggerClass,
	getLogger: getLogger,
	basicConfig: basicConfig,
	debug: debug,
	info: info,
	warning: warning,
	error: error,
	critical: critical,
	log: log,

	Filter: Filter,
	Formatter: Formatter,
	Handler: Handler,

	StreamHandler: handlers.StreamHandler,
	ConsoleHandler: handlers.ConsoleHandler,

	_test_reset: reset, // For tests only.
};


/** @private */
function reset() {
	Manager.clear();
	Manager.root = new Logger(null, 'root', Logger.WARNING);
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Filter":1,"./Formatter":3,"./Handler":4,"./Logger":5,"./Manager":6,"./handlers":7}],9:[function(require,module,exports){

var TimeFormatter = {};

TimeFormatter._validate = function(time) {
	if (!time || time.getTime() !== time.getTime()) {
		throw new Error('Argument time of strftime is not a valid time.');
	}
};

TimeFormatter._ISO = function(time, format) {
	return format.replace(/%ISO/g, function() {
		return time.toISOString();
	});
};

if (Date.prototype.toLocaleFormat) {
	TimeFormatter.format = function(time, format) {
		if (typeof format === 'undefined') {
			throw new Error('Argument format of strftime is not speciefied.');
		}
		TimeFormatter._validate(time);

		format = TimeFormatter._ISO(time, format);
		return time.toLocaleFormat(format);
	};
} else {
	TimeFormatter.map = {
		'a': '_notImplemented',
		'A': '_notImplemented',
		'b': '_notImplemented',
		'B': '_notImplemented',
		'c': 'toLocaleString',
		'd': 'getDay',
		'H': 'getHour',
		'I': 'get12Hour',
		'j': '_notImplemented',
		'm': 'getMonth',
		'M': 'getMinute',
		'p': 'getAmpm',
		'S': 'getSecond',
		's': 'getTimestamp',
		'U': '_notImplemented',
		'w': '_notImplemented',
		'W': '_notImplemented',
		'x': 'toLocaleDateString',
		'X': 'toLocaleTimeString',
		'y': 'getYear',
		'Y': 'getFullYear',
		'Z': '_notImplemented',
	};

	TimeFormatter._RE = /%(.)/g;

	TimeFormatter.format = function(time, format) {
		if (typeof format === 'undefined') {
			throw new Error('Argument format of strftime is not speciefied.');
		}
		TimeFormatter._validate(time);

		format = TimeFormatter._ISO(time, format);
		var cb = TimeFormatter._getReplacement.bind(TimeFormatter, time);
		var r = format.replace(TimeFormatter._RE, cb);

		return r;
	};

	TimeFormatter.toLocaleString = function(time) {
		return time.toLocaleString();
	};

	TimeFormatter.getDay = function(time) {
		var day = '' + time.getUTCDate();

		day = TimeFormatter._twoDigits(day);

		return day;
	};

	TimeFormatter.getHour = function(time) {
		var hour = '' + time.getUTCHours();

		hour = TimeFormatter._twoDigits(hour);

		return hour;
	};

	TimeFormatter.get12Hour = function(time) {
		var hour = time.getUTCHours();

		if (hour > 12) {
			hour = hour - 12;
		}
		hour = '' + hour;
		hour = TimeFormatter._twoDigits(hour);

		return hour;
	};

	TimeFormatter.getMonth = function(time) {
		var month = time.getUTCMonth();

		month = month + 1;
		month = '' + month;
		month = TimeFormatter._twoDigits(month);

		return month;
	};

	TimeFormatter.getMinute = function(time) {
		var minute = '' + time.getUTCMinutes();

		minute = TimeFormatter._twoDigits(minute);

		return minute;
	};

	TimeFormatter.getAmpm = function(time) {
		var hour = time.getUTCHours();

		return hour >= 12 ? 'PM' : 'AM';
	};

	TimeFormatter.getSecond = function(time) {
		var second = '' + time.getUTCSeconds();

		second = TimeFormatter._twoDigits(second);

		return second;
	};

	TimeFormatter.getTimestamp = function(time) {
		var seconds = Math.floor(time.getTime() / 1000);

		seconds = '' + seconds;

		return seconds;
	};

	TimeFormatter.toLocaleDateString = function(time) {
		return time.toLocaleDateString();
	};

	TimeFormatter.toLocaleTimeString = function(time) {
		return time.toLocaleTimeString();
	};

	TimeFormatter.getYear = function(time) {
		var year = '' + time.getUTCFullYear();

		year = TimeFormatter._twoDigits(year);

		return year;
	};

	TimeFormatter.getFullYear = function(time) {
		var year = '' + time.getUTCFullYear();

		return year;
	};

	TimeFormatter._getReplacement = function(time, match, directive) {
		if (directive === '%') {
			return '%';
		}

		var method = TimeFormatter.map[directive];
		if (method) {
			return TimeFormatter[method](time);
		}
		return directive;
	};

	TimeFormatter._twoDigits = function(s) {
		if (s.length < 2) {
			s = '0' + s;
		} else if (s.length > 2) {
			s = s.slice(-2);
		}

		return s;
	};

	TimeFormatter._notImplemented = function(time) {
		console.warn('This feature is not implemented.');
		return '';
	};
}


module.exports = TimeFormatter.format;

},{}],10:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],11:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],13:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":12,"_process":11,"inherits":10}]},{},[8])(8)
});