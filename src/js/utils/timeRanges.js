
/**
 * typedef {Object} TimeRange
 * @property {number} start
 * @property {number} end
 */

/**
 * TimeRanges to array.
 *
 * @param  {TimeRanges} timeRanges
 * @param  {number} joinGap
 * @return {Array<TimeRange>}
 */
export const toArray = (timeRanges, joinGap = 0) => {
	if (!timeRanges.length) {
		return [];
	}

	const r = [];
	for (let i = 0; i < timeRanges.length; i++) {
		if (joinGap && r.length
			&& (timeRanges.start(i) - r[r.length - 1].end) < joinGap) {
			r[r.length - 1].end = timeRanges.end(i);
		} else {
			r.push({
				start: timeRanges.start(i),
				end: timeRanges.end(i),
			});
		}
	}

	return r;
};

/**
 * @param  {Array<TimeRange>} buffered
 * @param  {number} time
 * @return {number}
 */
export const aheadOf = (buffered, time) => {
	if (!buffered.length) {
		return 0;
	}

	for (let i = buffered.length - 1; i >= 0; --i) {
		const { start, end } = buffered[i];
		if (start <= time && time < end) {
			return end - time;
		}
	}

	return 0;
};
