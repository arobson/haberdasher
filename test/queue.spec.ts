import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { queue } from '../src/index.js';
import type { HashQueue } from '../src/index.js';

let state: Record<string, unknown> = {};
let inUse: Record<string, boolean> = {};

function read(id: number): Promise<unknown> {
	if (inUse[id]) {
		return Promise.reject(new Error('Concurrent access violation!'));
	} else {
		inUse[id] = true;
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(state[id]);
			}, 10);
		});
	}
}

function reset(): void {
	inUse = {};
	state = {};
}

function write(id: number, val: unknown): Promise<unknown> {
	if (!inUse[id]) {
		return Promise.reject(new Error("Don't go changing things all willy-nilly!"));
	} else {
		return new Promise(resolve => {
			setTimeout(() => {
				state[id] = val;
				inUse[id] = false;
				resolve(val);
			}, 10);
		});
	}
}

function createTask(id: number): () => Promise<unknown> {
	return async () => {
		const thing = await read(id);
		return write(id, thing);
	};
}

describe('Hash queue', () => {
	describe('without queue', () => {
		describe('With a single id', () => {
			let err: Error | undefined;

			beforeEach(async () => {
				const tasks = [
					createTask(1),
					createTask(1),
					createTask(1)
				];
				const promises = tasks.map(t => {
					return t().catch((e: Error) => {
						err = e;
					});
				});
				await Promise.all(promises);
			});

			it('should result in an exception', () => {
				expect(err?.message).toBe('Concurrent access violation!');
			});

			afterEach(() => {
				reset();
			});
		});
	});

	describe('with queue', () => {
		describe('With a single id', () => {
			let err: Error | undefined;
			let hq: HashQueue;

			beforeEach(async () => {
				hq = queue.create();
				const promises = [
					hq.add(1, createTask(1)),
					hq.add(1, createTask(1)),
					hq.add(1, createTask(1))
				];
				await Promise.all(promises);
			});

			it('should not result in an exception', () => {
				expect(err).toBeUndefined();
			});

			afterEach(() => {
				hq.stop();
				reset();
			});
		});

		describe('With task results', () => {
			let results: unknown[];
			let hq: HashQueue;

			beforeEach(async () => {
				hq = queue.create();
				const promises = [
					hq.add(1, () => {
						return 1;
					}),
					hq.add(1, () => {
						return new Promise<number>(resolve => {
							setTimeout(() => {
								resolve(2);
							}, 10);
						});
					}),
					hq.add(1, () => {
						return Promise.resolve(3);
					})
				];
				results = await Promise.all(promises);
			});

			it('should produce expected results', () => {
				expect(results).toEqual([1, 2, 3]);
			});

			afterEach(() => {
				hq.stop();
				reset();
			});
		});
	});
});
