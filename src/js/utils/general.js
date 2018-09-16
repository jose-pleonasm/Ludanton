'use strict';
import { EXT_TYPE_MAP, NS } from '../settings.js';


const QUALITY_DESCRIPTOR_PATTERN = /([0-9]+)(p)/i;
let counter = 0;

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
 * generateId.
 * @param  {string} [namespace]
 * @return {string}
 */
export const generateId = (namespace = NS) => {
	counter = counter < Number.MAX_SAFE_INTEGER ? counter : 0;

	return `${namespace}-${Date.now()}-${counter++}`;
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
