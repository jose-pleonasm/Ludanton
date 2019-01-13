import getValue from 'get-value';

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
				const [state, path] = argumentsList;
				const value = getValue(state, path);
				if (this._cache[path] === value) {
					return;
				}

				const result = target(state, path);

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
		this._set(state, 'readyState');
		this._set(state, 'networkState');
		this._set(state, 'currentTime');
		this._set(state, 'src');
		this._set(state, 'currentSrc');
	}

	_set(state, path, domOptions) {
		if (!this._dom[path]) {
			this._dom[path] = window.document.createElement('div');
			this._container.appendChild(this._dom[path]);
		}

		const value = getValue(state, path);
		addElementToNode(this._dom[path], createOutputInput(path, value, domOptions));
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


/**
 * @param  {string}                        name
 * @param  {{name: string, value: string}} attrs
 * @param  {...*}                          children
 * @return {Element}
 */
function dom(name, attrs = {}, ...children) {
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
}
