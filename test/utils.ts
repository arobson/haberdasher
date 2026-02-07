import { expect } from 'vitest';

/**
 * Calculate standard deviation of an array of numbers
 */
function standardDeviation(values: number[]): number {
	const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
	const squareDiffs = values.map(value => {
		const diff = value - avg;
		return diff * diff;
	});
	const avgSquareDiff = squareDiffs.reduce((sum, value) => sum + value, 0) / squareDiffs.length;
	return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate coefficient of variation (CV)
 */
function coefficientOfVariation(values: number[]): number {
	const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
	const stdDev = standardDeviation(values);
	return stdDev / avg;
}

/**
 * Expect that the coefficient of variation is below a maximum threshold
 * This replaces chai-stats for distribution testing
 */
export function expectDeviation(values: number[], maxDeviation: number): void {
	const cv = coefficientOfVariation(values);
	expect(cv).toBeLessThanOrEqual(maxDeviation);
}

/**
 * Format high-resolution time array to human-readable string
 * Replaces pretty-hrtime dependency
 */
export function prettyTime(hrtime: [number, number]): string {
	const [seconds, nanoseconds] = hrtime;
	const totalNanoseconds = seconds * 1e9 + nanoseconds;

	if (totalNanoseconds < 1000) {
		return `${totalNanoseconds} ns`;
	} else if (totalNanoseconds < 1e6) {
		return `${(totalNanoseconds / 1000).toFixed(2)} μs`;
	} else if (totalNanoseconds < 1e9) {
		return `${(totalNanoseconds / 1e6).toFixed(2)} ms`;
	} else {
		return `${(totalNanoseconds / 1e9).toFixed(2)} s`;
	}
}
