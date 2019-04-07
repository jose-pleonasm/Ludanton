import { READY_STATE_MAP, NETWORK_STATE_MAP } from './constants.js';

/**
 * @param  {*} obj1
 * @param  {*} obj2
 * @return {boolean} True if objects are equal. False otherwise.
 */
export const isEqualObject = (obj1, obj2) => {
	if (obj1 === obj2) {
		return true;
	}
	if (!obj1 || !obj2) {
		return false;
	}

	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);
	if (obj1Keys.length !== obj2Keys.length) {
		return false;
	}
	if (obj1Keys.length === 0) {
		return true;
	}

	return !obj1Keys.some(key => {
		if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
			return !isEqualObject(obj1[key], obj2[key]);
		}

		return obj1[key] !== obj2[key];
	});
};

/**
 * @param  {number} code
 * @return {string}
 */
export const readyStateCodeToText = (code) => READY_STATE_MAP[code];

/**
 * @param  {number} code
 * @return {string}
 */
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
