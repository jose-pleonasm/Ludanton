import EventTarget from '../utils/EventTarget.js';
import { isEqualObject } from './utils.js';
import { mediaEventsList } from './events.js';

const source = (player, corePlayer, element) => ({
	currentSrc: element.currentSrc,
	src: element.src,
	srcObject: element.srcObject,
	videoTracks: element.videoTracks,
	audioTracks: element.audioTracks,
	currentSource: corePlayer.getSource(),
});

const time = (player, corePlayer, element) => ({
	currentTime: element.currentTime,
});

const condition = (player, corePlayer, element) => ({
	networkState: element.networkState,
	readyState: element.readyState,
});

const playback = (player, corePlayer, element) => ({
	paused: element.paused,
	seeking: element.seeking,
	ended: element.ended,
	playbackRate: element.playbackRate,
	playbackQuality: corePlayer.getVideoPlaybackQuality(),
});

const media = (player, corePlayer, element) => ({
	duration: element.duration,
});

export const EVENT_CHANGE = 'change';

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

		this.update = this.update.bind(this);
	}

	destroy() {
		if (this._intervalId) {
			clearInterval(this._intervalId);
		}
		this._relEvents.forEach(
			eventType => this._element.removeEventListener(eventType, this.update)
		);
	}

	set(player, element) {
		this._player = player;
		this._corePlayer = player._corePlayer;
		this._element = element;

		this._init();
	}

	getState() {
		return {
			...time(this._player, this._corePlayer, this._element),
			...source(this._player, this._corePlayer, this._element),
			...condition(this._player, this._corePlayer, this._element),
			...playback(this._player, this._corePlayer, this._element),
			...media(this._player, this._corePlayer, this._element),
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

	update(event) {
		const detail = this.getState();

		detail.eventType = event ? event.type : '';

		if (this._filter(detail)) {
			return;
		}

		this.history.push(detail);
		this.dispatchEvent(new CustomEvent(EVENT_CHANGE, { detail }));
	}

	_init() {
		this.update();
		if (this._config.interval) {
			this._intervalId = setInterval(this.update, this._config.interval);
		}
		this._relEvents.forEach(
			eventType => this._element.addEventListener(eventType, this.update)
		);
	}

	_filter(state) {
		const prevState = this.history.length ? this.history[this.history.length - 1] : null;
		return isEqualObject(state, prevState);
	}
}

Inspector.myMask = [
	'eventType',
	'currentTime',
	'paused',
	'seeking',
	'readyState',
	'networkState',
	'currentSrc',
	'currentSource',
];
