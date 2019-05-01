/* global jest:Object, test:Function, expect:Function, beforeEach:Function, describe:Function */
'use strict';
const { getTypeByFilename, parseQualityDescriptor, createLocalId } = require('../src/js/utils/general');

describe('#getTypeByFilename', () => {
	test('should return correct type.', () => {
		const path = '/path/to/video.mp4';
		let result = null;

		result = getTypeByFilename(path);

		expect(result).toBe('video/mp4');
	});
	test('should return empty string for unknown type.', () => {
		const path = '/path/to/video.unk';
		let result = null;

		result = getTypeByFilename(path);

		expect(result).toBe('');
	});
	test('should return empty string for filename without extension.', () => {
		const path = '/path/to/video';
		let result = null;

		result = getTypeByFilename(path);

		expect(result).toBe('');
	});
	test('should ignore query string.', () => {
		const path = '/path/to/video.webm?file=movie.mp4';
		let result = null;

		result = getTypeByFilename(path);

		expect(result).toBe('video/webm');
	});
	test('should ignore hash.', () => {
		const path = '/path/to/video.webm#file=movie.mp4';
		let result = null;

		result = getTypeByFilename(path);

		expect(result).toBe('video/webm');
	});
});

describe('#parseQualityDescriptor', () => {
	test('should return correct height.', () => {
		const qualityDescriptor = '720p';
		let result = null;

		result = parseQualityDescriptor(qualityDescriptor);

		expect(result).toEqual({ height: 720, unit: 'px' });
	});
	test('should return correct height for 4K.', () => {
		const qualityDescriptor = '4K';
		let result = null;

		result = parseQualityDescriptor(qualityDescriptor);

		expect(result).toEqual({ height: 2160, unit: 'px' });
	});
	test('should return null.', () => {
		const qualityDescriptor = '720ap';
		let result = null;

		result = parseQualityDescriptor(qualityDescriptor);

		expect(result).toBe(null);
	});
});

describe('#createLoacalId', () => {
	test('should return non empty string.', () => {
		let result = null;

		result = createLocalId();

		expect(typeof result).toBe('string');
		expect(!!result.length).toBe(true);
	});
	test('should return different id.', () => {
		const id1 = createLocalId();
		const id2 = createLocalId();

		expect(id1).not.toBe(id2);
	});
});
