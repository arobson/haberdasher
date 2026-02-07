/**
 * Type definitions for haberdasher
 */

// External library types

/**
 * RedBlack tree node interface
 */
export interface RedBlackNode<K, V> {
	key: K;
	value: V;
	log(): void;
}

/**
 * RedBlack tree interface
 */
export interface RedBlackTree<K, V> {
	add(key: K, value: V): void;
	remove(key: K): void;
	nearest(key: K): V | undefined;
	count(): number;
	root?: RedBlackNode<K, V>;
}

/**
 * RedBlack tree factory type
 */
export type RedBlackFactory = <K, V>() => RedBlackTree<K, V>;

/**
 * Farmhash module interface
 */
export interface FarmHashModule {
	hash32(input: string): number;
	hash64(input: string): string;
}

// Haberdasher types

/**
 * Consistent hash ring interface
 */
export interface Ring<T> {
	/**
	 * Add a node to the ring
	 * @param id - Unique identifier for the node
	 * @param value - The value to associate with this node
	 * @returns Array of virtual node hash values
	 */
	add(id: string | number, value: T): number[];

	/**
	 * Get the value for a given key using consistent hashing
	 * @param id - The key to hash
	 * @returns The value associated with the nearest node, or undefined if ring is empty
	 */
	get(id: string | number): T | undefined;

	/**
	 * Get all node IDs in the ring
	 * @returns Array of node identifiers
	 */
	getKeys(): string[];

	/**
	 * Count the number of nodes in the ring
	 * @returns Number of nodes (not virtual nodes)
	 */
	countKeys(): number;

	/**
	 * Count the total number of virtual nodes in the tree
	 * @returns Total virtual node count
	 */
	countNodes(): number;

	/**
	 * Log the tree structure (for debugging)
	 */
	logTree(): void;

	/**
	 * Remove a node from the ring
	 * @param id - The node identifier to remove
	 */
	remove(id: string | number): void;
}

/**
 * Task function type - can be sync or async
 */
export type Task<T> = () => T | Promise<T>;

/**
 * Deferred promise interface
 */
export interface Deferred<T> {
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
	promise: Promise<T>;
}

/**
 * Queue item holding a task and its deferred promise
 */
export interface QueueItem<T> {
	task: Task<T>;
	deferred: Deferred<T>;
}

/**
 * Internal queue interface
 */
export interface Queue {
	list: QueueItem<unknown>[];
	pending: Deferred<QueueItem<unknown> | undefined> | undefined;
	stopped?: boolean;
	push<T>(task: Task<T>): Promise<T>;
	pop(): Promise<QueueItem<unknown> | undefined>;
}

/**
 * Hash queue interface
 */
export interface HashQueue {
	/**
	 * Add a task to the queue for a given ID
	 * @param id - The key to determine which queue handles this task
	 * @param task - The task function to execute
	 * @returns Promise that resolves with the task result
	 */
	add<T>(id: string | number, task: Task<T>): Promise<T>;

	/**
	 * The underlying hash ring
	 */
	hash: Ring<Queue>;

	/**
	 * Array of queue instances
	 */
	queues: Queue[];

	/**
	 * Stop all queues
	 */
	stop(): void;

	/**
	 * Whether the queues have been stopped
	 */
	stopped: boolean;
}

/**
 * Internal state for hash ring
 */
export interface RingState {
	keys: Record<string, number[]>;
}
