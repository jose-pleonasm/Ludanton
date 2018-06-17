'use strict';
import LudantonError from './utils/error.js';
import EventTarget from './utils/eventtarget.js';
import createSource from './utils/createsource.js';
import NativePlayer from './core/nativeplayer.js';


class Player extends EventTarget {
	constructor(element) {
		super();

		this._corePlayer = new NativePlayer(element);
	}

	setSource(src) {
		const source = createSource(src);

		this._corePlayer.setSource(source[0]);
	}

	play() {
		this._corePlayer.play();
	}
}


export default Player;
