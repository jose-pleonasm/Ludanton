'use strict';


/**
 * @function createEvent
 * @param  {string} type
 * @param  {*} [detail]
 * @return {Event}
 */
export default (type, detail) => {
	return new CustomEvent(type, { detail });
};
