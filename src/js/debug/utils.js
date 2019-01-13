import { READY_STATE_MAP, NETWORK_STATE_MAP } from './constants.js';

export const isEqualObjectShallow = (obj1, obj2) => {
	if (!obj1 || !obj2) {
		return false;
	}
	if (obj1 === obj2) {
		return true;
	}

	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);
	if (obj1Keys.length !== obj2Keys.length) {
		return false;
	}
	if (obj1Keys.length === 0) {
		return true;
	}

	return !obj1Keys.some(key => obj1[key] !== obj2[key]);
};

export const readyStateCodeToText = (code) => READY_STATE_MAP[code];

export const networkStateCodeToText = (code) => NETWORK_STATE_MAP[code];

/**
 * @param  {string}                        name
 * @param  {{name: string, value: string}} attrs
 * @param  {...*}                          children
 * @return {Element}
 */
export const dom = (name, attrs = {}, ...children) => {
	children = children.reduce((prev, curr) => {
		if (!Array.isArray(prev)) {
			prev = [prev];
		}
		return prev.concat(curr);
	}, []);

	let elm = window.document.createElement(name);

	for (let prop of Object.keys(attrs)) {
		elm.setAttribute(prop, attrs[prop]);
	}
	for (let child of children) {
		if (typeof child == 'string') {
			child = window.document.createTextNode(child);
		}
		elm.appendChild(child);
	}

	return elm;
};
