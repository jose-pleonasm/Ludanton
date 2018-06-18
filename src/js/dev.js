'use strict';
import ludanton from './index.js';
import VideoProperties from './videomock/videoproperties.js';
import VideoModel from './videomock/videomodel.js';
import LudantonError from './utils/Error.js';
import LudantonEventTarget from './utils/EventTarget.js';
import createSource from './utils/createSource.js';

export default Object.assign(ludanton, {
	VideoProperties,
	VideoModel,
	LudantonError,
	LudantonEventTarget,
	createSource,
});
