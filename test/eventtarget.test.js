const LudantonEventTarget = require('../src/js/utils/eventtarget').default;


const mockCallback = jest.fn();
const mockAnotherCallback = jest.fn();
const mockStopCallback = jest.fn((event) => {
	event.stopImmediatePropagation();
});
const mockPreventCallback = jest.fn((event) => {
	event.preventDefault();
});
const mockEventListener = {
	handleEvent: jest.fn(),
};

class MockEvent {
	constructor(type) {
		this.type = type;
	}
}


beforeEach(() => {
	mockCallback.mockClear();
	mockAnotherCallback.mockClear();
	mockStopCallback.mockClear();
	mockPreventCallback.mockClear();
	mockEventListener.handleEvent.mockClear();
});


test('LudantonEventTarget#constructor', () => {
	const et = new LudantonEventTarget();

	expect(et instanceof LudantonEventTarget).toBeTruthy();
});

describe('#addEventListener', () => {
	test('should do the thing.', () => {
		const et = new LudantonEventTarget();

		expect(et.addEventListener('test', mockCallback)).toBeUndefined();
	});
	test('should throw a TypeError'
		+ ' when second argument is not an event listener.', () => {
		const et = new LudantonEventTarget();

		expect(() => {
			et.addEventListener('test', 'notAnEventListener');
		}).toThrow(TypeError);
	});
});

describe('#removeEventListener', () => {
	test('should do the thing.', () => {
		const et = new LudantonEventTarget();

		expect(et.removeEventListener('test', mockCallback)).toBeUndefined();
	});
	test('should throw a TypeError'
		+ ' when second argument is not an event listener.', () => {
		const et = new LudantonEventTarget();

		expect(() => {
			et.removeEventListener('test', 'notAnEventListener');
		}).toThrow(TypeError);
	});
});

describe('#dispatchEvent', () => {
	test('should do the thing.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		expect(et.dispatchEvent(event)).toBe(true);
	});
	test('should throw a TypeError'
		+ ' when first argument has not Event interface.', () => {
		const et = new LudantonEventTarget();

		expect(() => {
			et.dispatchEvent({});
		}).toThrow(TypeError);
	});
	test('should call only relevant event listener.', () => {
		const et = new LudantonEventTarget();
		const eventRel = new MockEvent('test');
		const eventIrrel = new MockEvent('another');

		et.addEventListener('test', mockCallback);
		et.dispatchEvent(eventRel);
		et.dispatchEvent(eventIrrel);

		expect(mockCallback.mock.calls.length).toBe(1);
	});
	test('should accept EventListener interface.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockEventListener);
		et.dispatchEvent(event);

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(1);
	});
	test('should call event listener as many times'
		+ ' as it is registered.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockCallback);
		et.addEventListener('test', mockCallback);
		et.addEventListener('test', mockCallback);
		et.addEventListener('another', mockCallback);
		et.dispatchEvent(event);

		expect(mockCallback.mock.calls.length).toBe(3);
	});
	test('should call event listener as many times'
		+ ' as how many times is event dispatched.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockCallback);
		et.dispatchEvent(event);
		et.dispatchEvent(event);

		expect(mockCallback.mock.calls.length).toBe(2);
	});
	test('should call event listener with correct event object.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');
		let callbackArg = null;

		et.addEventListener('test', mockCallback);
		et.dispatchEvent(event);

		callbackArg = mockCallback.mock.calls[0][0];
		expect(callbackArg).toBe(event);
		expect(callbackArg.type).toBe('test');
	});
	test('should call only first event listener'
		+ ' when stopImmediatePropagation was call.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockStopCallback);
		et.addEventListener('test', mockStopCallback);
		et.dispatchEvent(event);

		expect(mockStopCallback.mock.calls.length).toBe(1);
	});
	test('should call event listener only once, because'
		+ ' flag once is set to true.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockCallback, { once: true });
		et.addEventListener('test', mockAnotherCallback);
		et.dispatchEvent(event);
		et.dispatchEvent(event);

		expect(mockCallback.mock.calls.length).toBe(1);
		expect(mockAnotherCallback.mock.calls.length).toBe(2);
	});
	test('should return false'
		+ ' when preventDefault was call.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockPreventCallback);

		expect(et.dispatchEvent(event)).toBe(false);
	});
});

describe('Complex operations', () => {
	test('should not call unregistered event listener.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockCallback);
		et.removeEventListener('test', mockCallback);
		et.dispatchEvent(event);

		expect(mockCallback.mock.calls.length).toBe(0);
	});
	test('should not remove event listener, because'
		+ ' it has different capture flag.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockCallback, { capture: true });
		et.removeEventListener('test', mockCallback, { capture: false });
		et.dispatchEvent(event);

		expect(mockCallback.mock.calls.length).toBe(1);
	});
	test('should remove event listener, because'
		+ ' capture flag is evaluate as the same.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockCallback, { capture: false });
		et.removeEventListener('test', mockCallback, false);
		et.dispatchEvent(event);

		expect(mockCallback.mock.calls.length).toBe(0);
	});
	test('should remove event listener, because'
		+ ' passive flag is not relevant.', () => {
		const et = new LudantonEventTarget();
		const event = new MockEvent('test');

		et.addEventListener('test', mockCallback, { passive: true });
		et.removeEventListener('test', mockCallback, { passive: false });
		et.dispatchEvent(event);

		expect(mockCallback.mock.calls.length).toBe(0);
	});
});