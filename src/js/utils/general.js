import { EXT_TYPE_MAP } from '../settings.js';


export const getTypeByFilename = (path) => {
	const fileExt = getFileExt(path);
	const type = EXT_TYPE_MAP[fileExt];

	return type ? type : '';
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
