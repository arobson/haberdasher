import { describe, it, beforeEach, expect } from 'vitest';
import { ring } from '../src/index.js';
import { expectDeviation } from './utils.js';
import type { Ring } from '../src/index.js';

describe('Hash ring', () => {
	describe('with a single node', () => {
		let hash: Ring<number>;

		beforeEach(() => {
			hash = ring.create<number>();
			hash.add('one', 1);
		});

		it('should create correct number of keys', () => {
			expect(hash.countKeys()).toBe(1);
		});

		it('should create correct number of virtual nodes', () => {
			expect(hash.countNodes()).toBe(100);
		});

		it('should return the same value consistently', () => {
			const results = Array.from({ length: 100 }, (_, i) => {
				return hash.get(['somethingOrOther', i].join('-'));
			});
			const allAreOne = results.every(x => x === 1);
			expect(allAreOne).toBe(true);
		});
	});

	describe('with multiple nodes', () => {
		let hash: Ring<number>;
		const vnodes = 100;
		const totalVNodes = vnodes * 4;
		const reads = 1000;
		const deviation = (reads / 4) * 0.1;

		beforeEach(() => {
			hash = ring.create<number>(vnodes);
			hash.add('one', 1);
			hash.add('two', 2);
			hash.add('three', 3);
			hash.add('four', 4);
		});

		it('should have correct keys', () => {
			expect(hash.getKeys()).toEqual(['one', 'two', 'three', 'four']);
		});

		it('should create correct number of keys', () => {
			expect(hash.countKeys()).toBe(4);
		});

		it('should create correct number of virtual nodes', () => {
			expect(hash.countNodes()).toBe(totalVNodes);
		});

		it('should retrieve values for non-string keys', () => {
			expect(hash.get(190)).toBe(4);
		});

		it('should return an even distribution of values', () => {
			const values = Array.from({ length: reads }, (_, i) => {
				return hash.get(['somethingOrOther', i].join('-'));
			});

			// Count occurrences of each value
			const counts = values.reduce<Record<number, number>>((acc, val) => {
				if (val !== undefined) {
					acc[val] = (acc[val] || 0) + 1;
				}
				return acc;
			}, {});

			const countValues = Object.values(counts);
			expectDeviation(countValues, deviation / (reads / 4));
		});

		describe('after removing keys', () => {
			beforeEach(() => {
				hash.remove('one');
				hash.remove('three');
			});

			it('should have correct keys', () => {
				expect(hash.getKeys()).toEqual(['two', 'four']);
			});

			it('should have correct number of keys', () => {
				expect(hash.countKeys()).toBe(2);
			});

			it('should create correct number of virtual nodes', () => {
				expect(hash.countNodes()).toBe(totalVNodes / 2);
			});

			it('should not return removed values', () => {
				const values = Array.from({ length: reads }, (_, i) => {
					return hash.get(['somethingOrOther', i].join('-'));
				});

				// Get unique values
				const uniqueValues = Array.from(new Set(values.filter(v => v !== undefined)));
				expect(uniqueValues.sort()).toEqual([2, 4]);
			});

			it('should return an even distribution of values', () => {
				const values = Array.from({ length: reads }, (_, i) => {
					return hash.get(['somethingOrOther', i].join('-'));
				});

				// Count occurrences of each value
				const counts = values.reduce<Record<number, number>>((acc, val) => {
					if (val !== undefined) {
						acc[val] = (acc[val] || 0) + 1;
					}
					return acc;
				}, {});

				const countValues = Object.values(counts);
				expectDeviation(countValues, (reads / 2) * 0.1 / (reads / 2));
			});
		});
	});
});
