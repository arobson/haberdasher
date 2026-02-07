import { ring } from './hashring.js';
import type { HashQueue, Queue, QueueItem, Deferred, Task, Ring } from './types.js';

function addTask<T>(hash: Ring<Queue>, id: string | number, task: Task<T>): Promise<T> {
	const queue = hash.get(id.toString());
	if (!queue) {
		return Promise.reject(new Error('No queue available'));
	}
	return queue.push(task);
}

function createQueue(): Queue {
	const list: QueueItem<unknown>[] = [];
	return {
		list,
		pending: undefined,
		push<T>(task: Task<T>): Promise<T> {
			const item: QueueItem<T> = {
				task,
				deferred: defer<T>()
			};
			if (this.pending) {
				this.pending.resolve(item as QueueItem<unknown>);
				this.pending = undefined;
			} else {
				list.push(item as QueueItem<unknown>);
			}
			return item.deferred.promise;
		},
		pop(): Promise<QueueItem<unknown> | undefined> {
			if (list.length) {
				return Promise.resolve(list.shift());
			} else {
				this.pending = defer<QueueItem<unknown> | undefined>();
				return this.pending.promise;
			}
		}
	};
}

function defer<T>(): Deferred<T> {
	let resolveFunc!: (value: T) => void;
	let rejectFunc!: (reason?: unknown) => void;

	const promise = new Promise<T>((resolve, reject) => {
		resolveFunc = resolve;
		rejectFunc = reject;
	});

	return {
		resolve: resolveFunc,
		reject: rejectFunc,
		promise
	};
}

async function looper(queue: Queue): Promise<void> {
	try {
		const item = await queue.pop();
		if (!item) {
			return;
		}

		const result = await item.task();
		item.deferred.resolve(result);

		if (!queue.stopped) {
			void looper(queue);
		}
	} catch {
		if (!queue.stopped) {
			void looper(queue);
		}
	}
}

export function createHashQueue(limit?: number): HashQueue {
	const queueLimit = limit ?? 4;
	const hashRing = ring.create<Queue>();
	const queues: Queue[] = [];
	const state: HashQueue = {
		add<T>(id: string | number, task: Task<T>): Promise<T> {
			return addTask(hashRing, id, task);
		},
		hash: hashRing,
		queues,
		stop() {
			this.stopped = true;
			this.queues.forEach(queue => {
				queue.stopped = true;
				if (queue.pending) {
					queue.pending.resolve(undefined);
				}
			});
		},
		stopped: false
	};

	for (let i = 0; i < queueLimit; i++) {
		const queue = createQueue();
		queues[i] = queue;
		hashRing.add(i, queue);
		void looper(queue);
	}

	return state;
}

export const queue = {
	create: createHashQueue
};
