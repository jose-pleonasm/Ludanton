/* global test:Function, expect:Function */
const createSource = require('../src/js/utils/createsource').default;


test('should throw error if src is not specified.', () => {
	const executor = () => createSource();

	expect(executor).toThrow();
});

test('should throw error if src is an empty string.', () => {
	const executor = () => createSource('');

	expect(executor).toThrow();
});

test('should throw error if src is null.', () => {
	const executor = () => createSource(null);

	expect(executor).toThrow();
});

test('should return array with objects.', () => {
	const src = '/path/filename.mp4';
	let source = null;

	source = createSource(src);

	expect(Array.isArray(source)).toBe(true);
	source.every(item => {
		expect(typeof item).toBe('object');
	});
});

test('should return array with one object with right properties'
	+ ' if gives explicit object.', () => {
	const src = { src: '/path/filename.mp4', type: 'video/mp4' };
	let source = null;

	source = createSource(src);

	expect(source.length).toBe(1);
	expect(source[0].src).toBe(src.src);
	expect(source[0].type).toBe('video/mp4');
	expect(source[0].qualityDescriptor).toBe('');
});

test('should return array with two object with right properties'
	+ ' if gives array.', () => {
	const src = [
		{ src: '/path/filename.mp4', type: 'video/mp4' },
		{ src: '/path/filename.webm', type: 'video/webm' },
	];
	let source = null;

	source = createSource(src);

	expect(source.length).toBe(2);
	expect(source[0].src).toBe(src[0].src);
	expect(source[0].type).toBe('video/mp4');
	expect(source[0].qualityDescriptor).toBe('');
	expect(source[1].src).toBe(src[1].src);
	expect(source[1].type).toBe('video/webm');
	expect(source[1].qualityDescriptor).toBe('');
});

test('should return array with one object with right properties'
	+ ' if gives URL string.', () => {
	const src = '/path/filename.mp4';
	let source = null;

	source = createSource(src);

	expect(source.length).toBe(1);
	expect(source[0].src).toBe(src);
	expect(source[0].type).toBe('video/mp4');
	expect(source[0].qualityDescriptor).toBe('');
});

test('should return right src and qualityDescriptor'
	+ ' if gives explicit object.', () => {
	const src = {
		src: '/path/filename.mp4',
		type: 'video/mp4',
		qualityDescriptor: '720p',
	};
	let source = null;

	source = createSource(src);

	expect(source.length).toBe(1);
	expect(source[0].src).toBe('/path/filename.mp4');
	expect(source[0].type).toBe('video/mp4');
	expect(source[0].qualityDescriptor).toBe('720p');
});

test('should return right src and qualityDescriptor'
	+ ' if gives explicit array.', () => {
	const src = [
		{
			src: '/path/filename1.mp4',
			type: 'video/mp4',
			qualityDescriptor: '480p',
		},
		{
			src: '/path/filename2.mp4',
			type: 'video/mp4',
			qualityDescriptor: '1080p',
		},
	];
	let source = null;

	source = createSource(src);

	expect(source.length).toBe(2);
	expect(source[0].src).toBe('/path/filename1.mp4');
	expect(source[0].type).toBe('video/mp4');
	expect(source[0].qualityDescriptor).toBe('480p');
	expect(source[1].src).toBe('/path/filename2.mp4');
	expect(source[1].type).toBe('video/mp4');
	expect(source[1].qualityDescriptor).toBe('1080p');
});
