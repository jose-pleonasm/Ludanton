import { getTypeByFilename } from './general.js';
import './source.js';


/**
 * createSource
 * @param  {(MediaUrl|MediaObject|Array<MediaObject>)} msd
 * @return {Array<Source>}
 */
export default (msd) => {
	if (!msd) {
		throw new Error('Argument 0 of createSource is not valid.');
	}
	let sources = null;

	if (typeof msd === 'string') {
		const type = getTypeByFilename(msd);

		if (!type) {
			throw new Error('Argument 0 of createSource has unknown type.');
		}

		sources = [{ type, src: msd }];

	} else if (Array.isArray(msd)) {
		if (!msd.every(item => item.src && item.type)) {
			throw new Error('Argument 0 of createSource is not valid.');
		}

		sources = msd.map(item => ({ ...item }));

	} else {
		if (!msd.src || !msd.type) {
			throw new Error('Argument 0 of createSource is not valid.');
		}

		sources = [{ ...msd }];
	}

	sources = sources.map(source => {
		if (!source.qualityDescriptor) {
			source.qualityDescriptor = '';
		}

		return Object.freeze(source);
	});

	return sources;
};
