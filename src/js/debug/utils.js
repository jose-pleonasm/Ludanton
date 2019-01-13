
export const isEqualObjectShallow = (obj1, obj2) => {
	if (!obj1 || !obj2) {
		return false;
	}
	if (obj1 === obj2) {
		return true;
	}

	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);
	if (obj1Keys.length !== obj2Keys.length) {
		return false;
	}
	if (obj1Keys.length === 0) {
		return true;
	}

	return !obj1Keys.some(key => obj1[key] !== obj2[key]);
};
