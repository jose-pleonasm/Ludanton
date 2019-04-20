'use strict';

export const DEBUG = typeof process === 'object'
	&& process.env.NODE_ENV === 'development';

export const EXT_TYPE_MAP = Object.freeze({
	'mp4': 'video/mp4',
	'webm': 'video/webm',
	'ogg': 'video/ogg',
	'mov': 'video/quicktime',
	'm3u': 'application/vnd.apple.mpegurl',
	'm3u8': 'application/vnd.apple.mpegurl',
});

export const RESOLUTION_FACTOR = 1.15;

export const GET_CURRENT_SRC_INTERVAL = 200;

export const GET_CURRENT_SRC_TIMEOUT = 2e3;

export const PACKAGE_CODE = 'luda';

export const LEVELS = {
	NATIVE: 1,
	MAIN: 2,
};
