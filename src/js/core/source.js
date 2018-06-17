'use strict';

/**
 * @typedef {string} MediaUrl
 * @example
 * 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4'
 */

/**
 * @typedef {Object} MediaObject
 * @property {string} src
 * @property {string} type
 * @property {string} [qualityDescriptor]
 * @example
 * {
 * 	src: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
 * 	type: 'video/mp4'
 * }
 * OR
 * {
 * 	src: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
 * 	type: 'video/mp4',
 * 	qualityDescriptor: '720p'
 * }
 */

/**
 * @typedef {Array<MediaObject>} AlternativeMediaList
 * @example
 * [
 * 	{
 * 		src: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
 * 		type: 'video/mp4'
 * 	},
 * 	{
 * 		src: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.webm',
 * 		type: 'video/webm'
 * 	}
 * ]
 */

/**
 * @typedef {Array<MediaObject>} QualityMediaList
 * @example
 * [
 * 	{
 * 		src: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
 * 		type: 'video/mp4',
 * 		qualityDescriptor: '720p'
 * 	},
 * 	{
 * 		src: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_360p_surround.mp4',
 * 		type: 'video/mp4',
 * 		qualityDescriptor: '360p'
 * 	}
 * ]
 */

/**
 * @typedef {Object} Source
 * @property {string} src
 * @property {string} type
 * @property {string} qualityDescriptor
 */
