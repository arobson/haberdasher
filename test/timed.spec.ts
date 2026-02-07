import { describe, it, beforeEach, expect } from 'vitest';
import { ring } from '../src/index.js';
import { expectDeviation, prettyTime } from './utils.js';
import type { Ring } from '../src/index.js';

describe("Boat racin'!", () => {
	const vnodes = 1000;
	const totalVNodes = vnodes * 10;
	const reads = 10000;
	const deviation = (reads / 10) * 0.1;

	describe(`with 10 nodes and ${vnodes} virtual nodes each`, () => {
		let hash: Ring<number>;

		beforeEach(() => {
			hash = ring.create<number>(vnodes);
			const start = process.hrtime();

			// Add nodes sequentially
			for (let i = 1; i <= 10; i++) {
				const names = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
				hash.add(names[i - 1], i);
			}

			const end = process.hrtime(start);
			console.log('Added', totalVNodes, ' virtual nodes in:', prettyTime(end));
		});

		it('should create correct number keys', () => {
			expect(hash.countKeys()).toBe(10);
		});

		it('should create correct number of virtual nodes', () => {
			expect(hash.countNodes()).toBe(totalVNodes);
		});

		it('should return an even distribution of values', () => {
			const start = process.hrtime();

			const values = Array.from({ length: reads }, (_, i) => {
				return hash.get(['somethingOrOther', i].join('-'));
			});

			const end = process.hrtime(start);
			console.log(reads, 'lookups in:', prettyTime(end));

			// Count occurrences of each value
			const counts = values.reduce<Record<number, number>>((acc, val) => {
				if (val !== undefined) {
					acc[val] = (acc[val] || 0) + 1;
				}
				return acc;
			}, {});

			const countValues = Object.values(counts);
			console.log('distribution', countValues);

			expectDeviation(countValues, deviation / (reads / 10));
		});
	});
});
