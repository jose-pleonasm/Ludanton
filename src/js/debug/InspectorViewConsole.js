
export class InspectorViewConsole {
	constructor(inspector) {
		this._handleChange = this._handleChange.bind(this);

		inspector.addEventListener('change', this._handleChange);
	}

	_handleChange(event) {
		const { source } = event.detail;
		console.log({
			src: source.src,
			currentSrc: source.currentSrc,
		});
	}
}
