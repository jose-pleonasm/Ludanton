/* global jest:Object, test:Function, expect:Function, beforeEach:Function, describe:Function */
'use strict';
const { parseQualityDescriptor } = require('../src/js/utils/general');

describe('#parseQualityDescriptor', () => {
	test('should return correct height.', () => {
		const qualityDescriptor = '720p';
		let result = null;

		result = parseQualityDescriptor(qualityDescriptor);

		expect(result).toEqual({ height: 720, unit: 'px' });
	});
	test('should return null.', () => {
		const qualityDescriptor = '720ap';
		let result = null;

		result = parseQualityDescriptor(qualityDescriptor);

		expect(result).toBe(null);
	});
});
