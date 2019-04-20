'use strict';
import properties from './properties.js';
import Interface from './interface.js';

const createVideoMock = () => new Interface(Object.assign({}, properties));

export default {
	Interface,
	properties: Object.assign({}, properties),
	createVideoMock,
};
