
class StoppableChain {
	constructor() {
		/** @private {Promise} */
		this._promise = Promise.resolve();

		/** @private {boolean} */
		this._done = false;

		/** @private {boolean} */
		this._stopped = false;

		/** @private {Function} */
		this._stopResolve = null;

		/** @private {Promise} */
		this._stopPromise = new Promise((resolve) => {
			this._stopResolve = resolve;
		});
	}

	then(onFulfilled, onRejected) {
		if (this._done) {
			return;
		}

		this._promise = this._promise
			.then((data) => {
				if (this._stopped) {
					this._done = true;
					this._stopResolve();
					return;
				}

				if (onFulfilled) {
					return onFulfilled(data);
				}
			}, (reason) => {
				if (this._stopped) {
					this._done = true;
					this._stopResolve();
					return;
				}

				if (onRejected) {
					return onRejected(reason);
				}
			});

		return this;
	}

	catch(onRejected) {
		this._promise = this._promise
			.catch((reason) => {
				if (this._stopped) {
					this._done = true;
					this._stopResolve();
					return;
				}

				if (onRejected) {
					return onRejected(reason);
				}
			});

		return this;
	}

	stop() {
		this._stopped = true;

		return this._stopPromise;
	}
}

export default StoppableChain;
