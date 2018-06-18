(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.commonkit = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require('util');
var Filter = require('../core/Filter');
var Handler = require('../core/Handler');


/**
 * @module py-logging/commonkit
 */


//------------------------------------------------------------------------------
//   Helper function for extending
//------------------------------------------------------------------------------

/**
 * Extends given object by functions from this module.
 *
 * @function
 * @memberof module:py-logging/commonkit
 * @param  {Object} ns
 * @return {Object}
 */
function install(ns) {
	if (!ns || typeof ns !== 'object') {
		throw new Error('Argument 0 of install is not valid.');
	}

	return Object.assign(ns, module.exports);
}


//------------------------------------------------------------------------------
//   Formatters
//------------------------------------------------------------------------------

/**
 * JSON formatter.
 *
 * @constructor JsonFormatter
 */
function JsonFormatter() {}

/** @inheritdoc */
JsonFormatter.prototype.format = function(record) {
	return JSON.stringify(record);
};

/** @inheritdoc */
JsonFormatter.prototype.toString = function() {
	return '[object JsonFormatter]';
};


//------------------------------------------------------------------------------
//   Filters
//------------------------------------------------------------------------------

/**
 * Whitelist.
 *
 * @constructor WhiteListFilter
 * @extends Filter
 * @param {Array<string>} names Names of Loggers, that are allowed.
 */
function WhiteListFilter(names) {
	Filter.call(this);

	this._names = names;
}
util.inherits(WhiteListFilter, Filter);

/** @inheritdoc */
WhiteListFilter.prototype.filter = function(record) {
	return this._names.indexOf(record.name) > -1;
};


/**
 * Blacklist.
 *
 * @constructor BlackListFilter
 * @extends Filter
 * @param {Array<string>} names Names of Loggers, that are disallowed.
 */
function BlackListFilter(names) {
	Filter.call(this);

	this._names = names;
}
util.inherits(BlackListFilter, Filter);

/** @inheritdoc */
BlackListFilter.prototype.filter = function(record) {
	return this._names.indexOf(record.name) === -1;
};


//------------------------------------------------------------------------------
//   Accumulator
//------------------------------------------------------------------------------

/**
 * Accumulates equal records and transmits them when is necessary.
 *
 * @constructor AccumulativeHandler
 * @extends Handler
 * @param {Handler} [target]
 */
function AccumulativeHandler(target) {
	target = target || null;

	Handler.call(this);

	this._target = target;
	this._prevRecord = null;
}
util.inherits(AccumulativeHandler, Handler);

/**
 * Set the target handler for this handler.
 *
 * @param {Handler} target
 */
AccumulativeHandler.prototype.setTarget = function(target) {
	this._target = target;
};

/** @inheritdoc */
AccumulativeHandler.prototype.emit = function(record) {
	if (this.equal(record, this._prevRecord)) {
		this._prevRecord.numberofrecords++;

	} else {
		this.flush();
		this._prevRecord = record;
		this._prevRecord.numberofrecords = 1;
	}
};

/**
 * Flushes last record.
 */
AccumulativeHandler.prototype.flush = function() {
	if (!this._prevRecord) {
		return;
	}

	this._target.handle(this._prevRecord);
	this._prevRecord = null;
};

/**
 * Compares two records if are equal.
 *
 * @param  {module:py-logging.LogRecord} recordA
 * @param  {module:py-logging.LogRecord} recordB
 * @return {boolean} True if given records are equal. False otherwise.
 */
AccumulativeHandler.prototype.equal = function(recordA, recordB) {
	return recordA && recordB
		&& recordA.name === recordB.name
		&& recordA.process === recordB.process
		&& recordA.levelno === recordB.levelno
		&& recordA.message === recordB.message
		&& recordA.error == recordB.error;
};


module.exports = {
	install: install,
	JsonFormatter: JsonFormatter,
	WhiteListFilter: WhiteListFilter,
	BlackListFilter: BlackListFilter,
	AccumulativeHandler: AccumulativeHandler,
};

},{"../core/Filter":2,"../core/Handler":4,"util":9}],2:[function(require,module,exports){

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

},{}],3:[function(require,module,exports){

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

},{}],4:[function(require,module,exports){
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

},{"./Filterer":3,"./Logger":5,"util":9}],5:[function(require,module,exports){
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
},{"./Filterer":3,"util":9}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],9:[function(require,module,exports){
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
},{"./support/isBuffer":8,"_process":7,"inherits":6}]},{},[1])(1)
});