'use strict';

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
