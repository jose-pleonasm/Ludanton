'use strict';
import { getTypeByFilename, parseQualityDescriptor } from './general.js';
import '../core/Source.js';


/**
 * createSource
 * @param  {(MediaUrl|MediaObject|Array<MediaObject>)} msd
 * @return {Array<Source>}
 */
export const createSource = (msd) => {
	if (!msd) {
		throw new TypeError('Argument 0 of createSource is not valid.');
	}
	let sources = null;

	if (typeof msd === 'string') {
		const type = getTypeByFilename(msd);

		if (!type) {
			throw new TypeError('Argument 0 of createSource has unknown type.');
		}

		sources = [{ type, src: msd }];

	} else if (Array.isArray(msd)) {
		if (!msd.every(item => item.src && item.type)) {
			throw new TypeError('Argument 0 of createSource is not valid.');
		}

		sources = msd.map(item => ({ ...item }));

	} else {
		if (!msd.src || !msd.type) {
			throw new TypeError('Argument 0 of createSource is not valid.');
		}

		sources = [{ ...msd }];
	}

	sources = sources.map(source => {
		source.qualityDescriptor = source.qualityDescriptor
			? parseQualityDescriptor(source.qualityDescriptor)
			: null;

		return Object.freeze(source);
	});

	return Object.freeze(sources);
};

/**
 * getSourceByResolution.
 * @param  {QualityMediaList} sources
 * @param  {Resolution} resolution
 * @return {QualityDescriptor}
 */
export const getSourceByResolution = (sources, resolution) => {
	const resSources = sources.sort((a, b) => {
		return b.qualityDescriptor.height - a.qualityDescriptor.height;
	});

	for (var i = 0, len = resSources.length; i < len; i++) {
		if (resSources[i].qualityDescriptor.height <= resolution.height) {
			return resSources[i];
		}
	}
};
