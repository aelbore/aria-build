/* istanbul ignore file */
export function replace(string: string, needle: string, replacement: string | Function, options = {}) {
  if (typeof string !== 'string') {
		throw new TypeError(`Expected input to be a string, got ${typeof string}`);
	}

	if (!(typeof needle === 'string' && needle.length > 0) ||
		!(typeof replacement === 'string' || typeof replacement === 'function')) {
		return string;
	}

	let result = '';
  let matchCount = 0;
  /// @ts-ignore
	let prevIndex = options.fromIndex > 0 ? options.fromIndex : 0;

	if (prevIndex > string.length) {
		return string;
	}

	while (true) { 
		const index = string.indexOf(needle, prevIndex);

		if (index === -1) {
			break;
		}

		matchCount++;

    const replaceStr = typeof replacement === 'string' 
      ? replacement 
      : replacement(needle, matchCount, string, index);

    const beginSlice = matchCount === 1 
      ? 0 
      : prevIndex;

		result += string.slice(beginSlice, index) + replaceStr;
		prevIndex = index + needle.length;
	}

	if (matchCount === 0) {
		return string;
	}

	return result + string.slice(prevIndex);
}