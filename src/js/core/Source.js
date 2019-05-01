'use strict';

/**
 * @typedef {string} MediaUrl
 * @example
 * 'https://ia800209.us.archive.org/20/items/ElephantsDream/ed_hd.mp4'
 */

/**
 * @typedef {Object} MediaObject
 * @property {string} src
 * @property {string} type
 * @property {string} [qualityDescriptor]
 * @example
 * {
 * 	src: 'https://ia800209.us.archive.org/20/items/ElephantsDream/ed_hd.mp4',
 * 	type: 'video/mp4'
 * }
 * OR
 * {
 * 	src: 'https://ia800209.us.archive.org/20/items/ElephantsDream/ed_hd.mp4',
 * 	type: 'video/mp4',
 * 	qualityDescriptor: '720p'
 * }
 */

/**
 * @typedef {Array<MediaObject>} AlternativeMediaList
 * @example
 * [
 * 	{
 * 		src: 'https://ia800209.us.archive.org/20/items/ElephantsDream/ed_hd.mp4',
 * 		type: 'video/mp4'
 * 	},
 * 	{
 * 		src: 'https://archive.org/download/ElephantsDream/ed_hd.ogv',
 * 		type: 'video/ogg'
 * 	}
 * ]
 */

/**
 * @typedef {Array<MediaObject>} QualityMediaList
 * @example
 * [
 * 	{
 * 		src: 'https://ia800209.us.archive.org/20/items/ElephantsDream/ed_hd.mp4',
 * 		type: 'video/mp4',
 * 		qualityDescriptor: '720p'
 * 	},
 * 	{
 * 		src: 'https://ia800209.us.archive.org/20/items/ElephantsDream/ed_lq.mp4',
 * 		type: 'video/mp4',
 * 		qualityDescriptor: '360p'
 * 	}
 * ]
 */

/**
 * @typedef {Object} QualityDescriptor
 * @property {number} height
 * @property {string} unit
 */

/**
 * @typedef {Object} Source
 * @property {string} src
 * @property {string} type
 * @property {(QualityDescriptor|null)} qualityDescriptor
 */
