import getValue from 'get-value';
import { dom, readyStateCodeToText, networkStateCodeToText } from './utils.js';
import './inspector.css';

export class InspectorViewHtml {
	constructor(inspector, element) {
		this._handleChange = this._handleChange.bind(this);
		this._set = this._set.bind(this);

		this._container = window.document.createElement('section');
		this._container.className = 'inspector';
		this._dom = {};
		this._cache = {};

		this._set = new Proxy(this._set, {
			apply: (target, thisArg, argumentsList) => {
				const [state, path, formatter] = argumentsList;
				const value = getValue(state, path);
				if (this._cache[path] === value) {
					return;
				}

				const result = target(state, path, formatter);

				this._cache[path] = value;
				return result;
			}
		});

		element.appendChild(this._container);
		inspector.addEventListener('change', this._handleChange);
	}

	_handleChange(event) {
		const state = event.detail;
		this._set(state, 'paused');
		this._set(state, 'seeking');
		this._set(state, 'readyState', readyStateCodeToText);
		this._set(state, 'networkState', networkStateCodeToText);
		this._set(state, 'currentTime');
		this._set(state, 'source.src');
		this._set(state, 'currentSrc');
	}

	_set(state, path, formatter = i => i, domOptions) {
		if (!this._dom[path]) {
			this._dom[path] = window.document.createElement('div');
			this._container.appendChild(this._dom[path]);
		}

		const value = getValue(state, path);
		addElementToNode(this._dom[path], createOutputInput(path, formatter(value), domOptions));
	}
}

const makeSafeString = (s) => s.replace('.', '-');

const addElementToNode = (node, element) => {
	node.innerHTML = element.outerHTML;
};

const createOutputInput = (name, value, { size = 80, id = makeSafeString(name) } = {}) =>
	dom('div', { class: `inspector-item-${makeSafeString(name)}` },
		dom('label', { for: id }, `${name}:`),
		dom('input', { id, name, value, size, type: 'text', readonly: true }),
	);
