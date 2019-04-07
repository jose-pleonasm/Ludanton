import EventTarget from '../utils/EventTarget.js';
import { isEqualObject } from './utils.js';
import { mediaEventsList } from './events.js';

/* selectors */
const source = (player, element) => ({
	currentSrc: element.currentSrc,
	src: element.src,
	srcObject: element.srcObject,
	videoTracks: element.videoTracks,
	audioTracks: element.audioTracks,
	currentSource: player._corePlayer.getSource(),
});

const time = (player, element) => ({
	currentTime: element.currentTime,
});

const condition = (player, element) => ({
	networkState: element.networkState,
	readyState: element.readyState,
});

const error = (player, element) => ({
	error: element.error
		? {
			code: element.error.code,
			message: element.error.message,
			toString: () => element.error.message || element.error.code,
		}
		: null,
});

const playback = (player, element) => ({
	paused: element.paused,
	seeking: element.seeking,
	ended: element.ended,
	playbackRate: element.playbackRate,
	playbackQuality: player._corePlayer.getVideoPlaybackQuality(),
});

const media = (player, element) => ({
	duration: element.duration,
	videoWidth: element.videoWidth,
	videoHeight: element.videoHeight,
});

const setting = (player, element) => ({
	autoplay: element.autoplay,
	preload: element.preload,
});

export class Inspector extends EventTarget {
	constructor(config) {
		super();

		this._config = {
			interval: null,
			...config,
		};
		this.history = [];
		this._player = null;
		this._corePlayer = null;
		this._element = null;
		this._intervalId = null;
		this._listeners = [];
		this._relEvents = mediaEventsList;

		this.track = this.track.bind(this);
	}

	destroy() {
		if (this._intervalId) {
			clearInterval(this._intervalId);
		}
		this._relEvents.forEach(
			eventType => this._element.removeEventListener(eventType, this.track)
		);
	}

	set(player, element) {
		this._player = player;
		this._element = element;

		this._init();
	}

	getState() {
		return {
			...setting(this._player, this._element),
			...time(this._player, this._element),
			...source(this._player, this._element),
			...condition(this._player, this._element),
			...playback(this._player, this._element),
			...media(this._player, this._element),
			...error(this._player, this._element),
		};
	}

	getHistory(mask = null) {
		let history = [...this.history];

		if (mask && Array.isArray(mask)) {
			history = history.map(item => {
				return mask.reduce(
					(newItem, key) => { newItem[key] = item[key]; return newItem; },
					{}
				);
			});
		}

		return history;
	}

	getMyHistory() {
		return this.getHistory(Inspector.myMask);
	}

	inspect(event = null) {
		return {
			...this.getState(),
			eventType: event ? event.type : '',
		};
	}

	track(event = null) {
		const detail = this.inspect(event);

		if (this._filter(detail)) {
			return;
		}

		this.history.push(detail);
		this.dispatchEvent(new CustomEvent(Inspector.EVENT_UPDATE, { detail }));
	}

	_init() {
		this.track();
		if (this._config.interval) {
			this._intervalId = setInterval(this.track, this._config.interval);
		}
		this._relEvents.forEach(
			eventType => this._element.addEventListener(eventType, this.track)
		);
	}

	_filter(state) {
		const prevState = this.history.length ? this.history[this.history.length - 1] : null;
		return isEqualObject(state, prevState);
	}
}

Inspector.EVENT_UPDATE = 'update';

Inspector.myMask = [
	'eventType',
	'currentTime',
	'paused',
	'seeking',
	'readyState',
	'networkState',
	'currentSrc',
	'currentSource',
	'error',
];
