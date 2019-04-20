'use strict';
import ludanton from './index.js';
import mock from './mock/index.js';
import debug from './debug/index.js';

import LudantonError from './utils/Error.js';
import LudantonEventTarget from './utils/EventTarget.js';

export default Object.assign(
	ludanton,
	mock,
	debug,
	{
		LudantonError,
		LudantonEventTarget,
	}
);
