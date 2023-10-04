/* global jest:Object, test:Function, expect:Function, beforeEach:Function, describe:Function */
'use strict';
const EventTarget = require('../src/js/utils/EventTarget').default;
const EventManager = require('../src/js/utils/EventManager').default;


const mockEventListener = {
	handleEvent: jest.fn(),
};

const mockEventListener2 = {
	handleEvent: jest.fn(),
};


beforeEach(() => {
	mockEventListener.handleEvent.mockClear();
	mockEventListener2.handleEvent.mockClear();
});

describe('#listen', () => {
	test('should add listener.', () => {
		const eventManager = new EventManager([
			['test', mockEventListener.handleEvent],
		]);
		const target = new EventTarget();

		eventManager.listen(target, 'test');
		target.dispatchEvent(new Event('test'));

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(1);
	});
	test('should add listener twice.', () => {
		const eventManager = new EventManager([
			['test', mockEventListener.handleEvent],
		]);
		const target = new EventTarget();

		eventManager.listen(target, 'test');
		eventManager.listen(target, 'test');
		target.dispatchEvent(new Event('test'));

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(2);
	});
	test('should add all listeners.', () => {
		const eventManager = new EventManager([
			['test', mockEventListener.handleEvent],
			['test2', mockEventListener2.handleEvent],
		]);
		const target = new EventTarget();

		eventManager.listen(target, 'test');
		eventManager.listen(target, 'test2');
		target.dispatchEvent(new Event('test'));
		target.dispatchEvent(new Event('test2'));

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(1);
		expect(mockEventListener2.handleEvent.mock.calls.length).toBe(1);
	});
	test('should remove listener.', () => {
		const eventManager = new EventManager([
			['test', mockEventListener.handleEvent],
		]);
		const target = new EventTarget();

		eventManager.listen(target, 'test');
		eventManager.unlisten(target, 'test');
		target.dispatchEvent(new Event('test'));

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(0);
	});
	test('should remove both listeners for the same event.', () => {
		const eventManager = new EventManager([
			['test', mockEventListener.handleEvent],
		]);
		const target = new EventTarget();

		eventManager.listen(target, 'test');
		eventManager.listen(target, 'test');
		eventManager.unlisten(target, 'test');
		target.dispatchEvent(new Event('test'));

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(0);
	});
	test('should remove all listeners.', () => {
		const eventManager = new EventManager([
			['test', mockEventListener.handleEvent],
			['test2', mockEventListener2.handleEvent],
		]);
		const target = new EventTarget();

		eventManager.listen(target, 'test');
		eventManager.listen(target, 'test2');
		eventManager.unlisten(target, 'test');
		eventManager.unlisten(target, 'test2');
		target.dispatchEvent(new Event('test'));
		target.dispatchEvent(new Event('test2'));

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(0);
		expect(mockEventListener2.handleEvent.mock.calls.length).toBe(0);
	});
	test('should remove all listeners for specified target.', () => {
		const eventManager = new EventManager([
			['test', mockEventListener.handleEvent],
			['test2', mockEventListener2.handleEvent],
		]);
		const target = new EventTarget();

		eventManager.listen(target, 'test');
		eventManager.listen(target, 'test2');
		eventManager.unlistenAll(target);
		target.dispatchEvent(new Event('test'));
		target.dispatchEvent(new Event('test2'));

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(0);
		expect(mockEventListener2.handleEvent.mock.calls.length).toBe(0);
	});
	test('should clear.', () => {
		const eventManager = new EventManager([
			['test', mockEventListener.handleEvent],
			['test2', mockEventListener2.handleEvent],
		]);
		const target = new EventTarget();

		eventManager.listen(target, 'test');
		eventManager.listen(target, 'test2');
		eventManager.clear();
		target.dispatchEvent(new Event('test'));
		target.dispatchEvent(new Event('test2'));

		expect(mockEventListener.handleEvent.mock.calls.length).toBe(0);
		expect(mockEventListener2.handleEvent.mock.calls.length).toBe(0);
	});
});
