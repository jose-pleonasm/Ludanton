'use strict';

export const DEBUG = true;

export const EXT_TYPE_MAP = Object.freeze({
	'mp4': 'video/mp4',
	'webm': 'video/webm',
	'ogg': 'video/ogg',
	'mov': 'video/quicktime',
	'm3u': 'application/vnd.apple.mpegurl',
	'm3u8': 'application/vnd.apple.mpegurl',
});

export const RESOLUTION_FACTOR = 1.15;

export const NS = (() => {
	if (typeof window !== 'undefined' && window && window.location) {
		return window.location.host.replace(/[^\w-\.]/g, '_');

	} else if (typeof process !== 'undefined' && process && process.pid) {
		return String(process.pid);

	} else {
		return 'ns';
	}
})();
