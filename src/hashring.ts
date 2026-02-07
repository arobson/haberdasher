import rbFactory from 'redblack.js';
import farmhash from 'farmhash';
import type { Ring, RingState, RedBlackTree } from './types.js';

const { hash32 } = farmhash;

function addNode<T>(
	state: RingState,
	tree: RedBlackTree<number, T>,
	count: number,
	id: string | number,
	value: T
): number[] {
	const vnodes = addVirtualNodes(tree, id, value, count);
	state.keys[id.toString()] = vnodes;
	return vnodes;
}

function addVirtualNodes<T>(
	tree: RedBlackTree<number, T>,
	id: string | number,
	value: T,
	count: number
): number[] {
	const list: number[] = [];
	for (let i = 0; i < count; i++) {
		const hash = hash32(`${id}:${i}`);
		tree.add(hash, value);
		list.push(hash);
	}
	return list;
}

function get<T>(tree: RedBlackTree<number, T>, id: string | number): T | undefined {
	const hash = hash32(id.toString());
	return tree.nearest(hash);
}

function removeNode<T>(state: RingState, tree: RedBlackTree<number, T>, id: string | number): void {
	const keys = state.keys[id.toString()];
	if (keys) {
		keys.forEach(key => {
			tree.remove(key);
		});
		delete state.keys[id.toString()];
	}
}

export function createRing<T>(virtualNodes?: number): Ring<T> {
	const vnodes = virtualNodes ?? 100;
	const tree = rbFactory<number, T>();
	const state: RingState = {
		keys: {}
	};

	return {
		add: (id: string | number, value: T) => addNode(state, tree, vnodes, id, value),
		get: (id: string | number) => get(tree, id),
		getKeys: () => Object.keys(state.keys),
		countKeys: () => Object.keys(state.keys).length,
		countNodes: () => tree.count(),
		logTree: () => {
			if (tree.root) {
				tree.root.log();
			}
		},
		remove: (id: string | number) => removeNode(state, tree, id)
	};
}

export const ring = {
	create: createRing
};
