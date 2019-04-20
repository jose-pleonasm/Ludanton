'use strict';
import ludanton from './index.js';
import videomock from './videomock/index.js';
import debug from './debug/index.js';

import LudantonError from './utils/Error.js';
import LudantonEventTarget from './utils/EventTarget.js';

export default Object.assign(
	ludanton,
	videomock,
	debug,
	{
		LudantonError,
		LudantonEventTarget,
	}
);
