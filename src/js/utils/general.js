'use strict';
import { EXT_TYPE_MAP, PACKAGE_CODE } from '../settings.js';


const QUALITY_DESCRIPTOR_PATTERN = /([0-9]+)(p)/i;
let scope = Date.now().toString(16);
let counter = 10000000;

/**
 * getTypeByFilename.
 * @example
 * // returns 'video/mp4'
 * getTypeByFilename(
 * 	'https://ia800209.us.archive.org/20/items/ElephantsDream/ed_hd.mp4'
 * );
 * @param  {string} path
 * @return {string}
 */
export const getTypeByFilename = (path) => {
	const fileExt = getFileExt(path);
	const type = EXT_TYPE_MAP[fileExt];

	return type ? type : '';
};

/**
 * parseQualityDescriptor.
 * @param  {string} descriptor
 * @return {QualityDescriptor}
 */
export const parseQualityDescriptor = (descriptor) => {
	const result = descriptor.match(QUALITY_DESCRIPTOR_PATTERN);

	if (!result) {
		return null;
	}

	return {
		height: Number(result[1]),
		unit: 'px',
	};
};

/**
 * createLocalId.
 * @param  {string} [namespace]
 * @return {string}
 */
export const createLocalId = () => {
	if (counter === 11111111) {
		scope = Date.now().toString(16);
		counter = 10000000;
	}

	counter++;
	return `${PACKAGE_CODE}${scope}${counter.toString(16)}`;
};

/**
 * nextEvent.
 *
 * https://twitter.com/DasSurma/status/1078375282183151617
 *
 * @param  {Object} target
 * @param  {string} name
 * @return {Promise<Event>}
 */
export const nextEvent = (target, name) => {
	return new Promise(resolve => {
		target.addEventListener(name, resolve, { once: true });
	});
};

/**
 * makeTimeout.
 * @param  {number} time time in milliseconds
 * @param  {string} [msg]
 * @return {Promise}
 */
export const makeTimeout = (time, msg = 'Timeout') => {
	let timeoutId;
	const promise = new Promise((resolve, reject) => {
		timeoutId = setTimeout(reject, time, new Error(msg));
	});
	promise.$cancel = () => clearTimeout(timeoutId);

	return promise;
};


const getFileExt = (path) => {
	if (!path || typeof path !== 'string') {
		return '';
	}

	let clearPath = path;
	const qsStart = clearPath.indexOf('?');
	if (qsStart > -1) {
		clearPath = clearPath.slice(0, qsStart);
	}
	const hashStart = clearPath.indexOf('#');
	if (hashStart > -1) {
		clearPath = clearPath.slice(0, hashStart);
	}

	const lastDotStart = clearPath.lastIndexOf('.');
	if (lastDotStart < 1) {
		return '';
	}

	return clearPath.slice(lastDotStart + 1).toLowerCase();
};
