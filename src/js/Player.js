'use strict';
import LudantonError from './utils/Error.js';
import EventTarget from './utils/EventTarget.js';
import createSource from './utils/createSource.js';
import NativePlayer from './core/NativePlayer.js';
import logging from './utils/logging.js';


const logger = logging.getLogger('Player');


class Player extends EventTarget {
	constructor(element) {
		super();

		this._corePlayer = new NativePlayer(element);
	}

	setSource(src) {
		logger.trace('#setSource', [src]);
		const source = createSource(src);

		this._corePlayer.setSource(source[0]);
	}

	play() {
		this._corePlayer.play();
	}
}


export default Player;
