const LudantonEventTarget = require('../dist/utils/eventtarget').default;

function eventListener() {};

test('LudantonEventTarget#constructor', () => {
	const et = new LudantonEventTarget();

	expect(et instanceof LudantonEventTarget).toBeTruthy();
});

describe('#addEventListener', () => {
	test('should do the thing.', () => {
		const et = new LudantonEventTarget();

		expect(et.addEventListener('event', eventListener)).toBeUndefined();
	});
	test('should throw a TypeError'
		+ ' when second argument is not an event listener.', () => {
		const et = new LudantonEventTarget();

		expect(() => {
			et.addEventListener('event', 'notAnEventListener')
		}).toThrow(TypeError);
	});
});

describe('#removeEventListener', () => {
	test('should do the thing.', () => {
		const et = new LudantonEventTarget();

		expect(et.removeEventListener('event', eventListener)).toBeUndefined();
	});
	test('should throw a TypeError'
		+ ' when second argument is not an event listener.', () => {
		const et = new LudantonEventTarget();

		expect(() => {
			et.removeEventListener('event', 'notAnEventListener')
		}).toThrow(TypeError);
	});
});
