## haberdasher

A consistent-hash ring based on farmhash and redblack.js, now with full TypeScript support.

The expectation is that you will store key/values but look them up by another value that you want an evenly random distributions across.

It also includes a hashed queue implementation to shard tasks across queues so that you can guarantee mutual exclusion of asynchronous task execution based on id.

[![CI Status](https://github.com/arobson/haberdasher/workflows/CI/badge.svg)](https://github.com/arobson/haberdasher/actions)
[![Coverage Status][coveralls-image]][coveralls-url]
[![Version npm][version-image]][version-url]
[![npm Downloads][downloads-image]][downloads-url]

## Requirements

- **Node.js 22.0.0 or higher** - This package uses modern ES2022+ features and native ESM
- TypeScript 5.6+ (if using TypeScript)

## Concepts

haberdasher uses a red-black tree to keep insert, lookup, and delete operations O(log n). It defaults to 100 virtual nodes per key/value pair inserted into the ring. The more virtual nodes you use per key, the more evenly distributed gets will be across key/value pairs. The trade-off will be slightly slower access times.

haberdasher uses farmhash to hash keys quickly and with little-to-no collision. In practicality, in the unlikely event collisions do occur they have impercetible impact on distribution.

Keys should be strings or numbers. Values can be anything you would like statistically even distribution across.

## Use Cases

Sharding is the most common application I have for this module. Because I often use this to shard tasks across possible asyncronous runners without collision, this module includes an implementation of a work queue that will prevent parallel execution of asynchronous tasks against the same id.

## Installation

```bash
npm install haberdasher
```

## Use

### Hashring (JavaScript/ESM)

```javascript
import { ring } from 'haberdasher';

// create a hash ring with 100 vnodes per key
const hash = ring.create();

// create a hash ring with custom number of vnodes per key
const hash2 = ring.create(1000);
```

### Hashring (TypeScript)

```typescript
import { createRing, type Ring } from 'haberdasher';

// Create a typed hash ring
const hash: Ring<{ name: string }> = createRing(100);

// Add values
hash.add('key1', { name: 'one' });
hash.add('key2', { name: 'two' });

// Get value with full type safety
const value = hash.get('lookup'); // Type: { name: string } | undefined
```

### Hashqueue (JavaScript/ESM)

```javascript
import { queue } from 'haberdasher';

const tasks = queue.create(2); // number of queues

// no more than 2 tasks will run at any one time
// tasks will be mapped to worker queue based on the hash of their id
Promise.all([
  tasks.add(1, () => console.log(1)),
  tasks.add(2, () => console.log(2)),
  tasks.add(3, () => console.log(3)),
  tasks.add(4, () => console.log(4))
])
.then(results => {
  // results will be empty since the tasks aren't returning anything
});
```

### Hashqueue (TypeScript)

```typescript
import { createHashQueue, type HashQueue } from 'haberdasher';

const tasks: HashQueue = createHashQueue(2);

// Add typed tasks
const result = await tasks.add(1, async () => {
  return { data: 'processed' };
}); // Type: { data: string }
```

## Hashring API

The API is very simple. Add and get operations return synchronously thanks to farmhash's simple API.

### `add(key, value)`

Add a key/value pair to the hash.

```javascript
hash.add('key1', { name: 'one' });
hash.add('key2', { name: 'two' });
hash.add('key3', { name: 'three' });
```

### `get(lookup)`

Returns a value based on how the hashed key maps to the hash ring.

```javascript
const value = hash.get('bacon');
```

### `remove(key)`

Removes the key/value pair from the hash ring.

```javascript
hash.remove('key3');
```

### Other methods

- `getKeys()` - Returns array of all node IDs
- `countKeys()` - Returns number of nodes (not virtual nodes)
- `countNodes()` - Returns total number of virtual nodes
- `logTree()` - Logs the tree structure for debugging

## Hashqueue API

### `create(concurrencyLimit)`

Creates a new hashqueue with the specified concurrency limit. The default limit is 4. Higher limits are better as the set of ids increase. Long-running tasks can slow things down, especially with lower limits.

```javascript
const queue = hashqueue.create(2);
```

### `add(id, task)`

Add a task to the queue. Returns a promise that will resolve to the value returned from the task when the task has completed.

Tasks can be synchronous or asynchronous (return a Promise).

```javascript
// this example will print 'tada' after roughly 100 ms.
const promise = queue.add(100, () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('tada');
    }, 100);
  });
});
promise.then(console.log);

// TypeScript example with typed return
const result = await queue.add<string>(100, async () => {
  return 'typed result';
}); // result: string
```

### `stop()`

Stops all task runners. Ideally only used before disposal of the queue; a use case that will generally come up in testing.

## Distribution

The default number of vnodes (100) seems adequate to provide a standard deviation of 10% across key/value pairs. This may vary depending on the number of reads and keys used during get operations.

## Rough performance numbers

Of course, YMMV dependening largely on the processor. On a 2.6 GHz core i7, it takes 18 **microseconds** (on average) to lookup a key in a hashring with 10,000 virtual nodes. (in this case a hash with 10 key value/pairs and 1000 vnodes each) This performance seems to hold steady under constant load.

## Why Not Modulo?

Modulo can work well as a simple way to map a numeric key to an array of (databases|servers|work queues|?) but what happens when the list of available things to map fluctuates. If you're not very careful about how this is implemented you will end up with unexpected results - not to mention that you will need to ensure that every instance/node maps identically despite variance in environment or input order. In other words - there is a lot of risk to how the modulo index maps to available items in the array.

To support non-integer keys, you'll have to do a fair amount of massaging to get other types of keys to work with this approach.

Once you've put in the additional key processing, and a great deal of safeguards to ensure all nodes will create a consistent map, you've basically reinvented an arguably more complex, and perhaps less efficient, means of sharding.

## Migrating from v1.x to v2.0

Version 2.0 is a complete rewrite in TypeScript with breaking changes:

### Breaking Changes

1. **ESM Only**: No CommonJS support
   ```javascript
   // Old (v1.x)
   const ring = require('haberdasher').ring;

   // New (v2.x)
   import { ring } from 'haberdasher';
   ```

2. **Node.js 22+ Required**: Requires Node.js 22.0.0 or higher

3. **Updated Dependencies**:
   - farmhash 2.x → 3.x
   - redblack.js 0.x → 1.x

### New Features

- Full TypeScript support with complete type definitions
- Generic types for type-safe hash rings
- Modern ES2022+ syntax
- Improved async/await patterns in queue implementation

### Migration Steps

1. Upgrade Node.js to version 22 or higher
2. Update your package.json to use `"type": "module"` if not already
3. Change all `require()` statements to `import` statements
4. Update file extensions to `.mjs` or use `"type": "module"` in package.json
5. Run tests to ensure compatibility

## Note About The Name

Yes, a haberdasher has nothing to do with hashing or computers. My grandfather was a haberdasher and it's just a fun word to say. Given it's rare use in our language, I wasn't worried that anyone would think that I'd created a module that tailored/sold upscale men's clothing.

[coveralls-url]: https://coveralls.io/github/arobson/haberdasher?branch=main
[coveralls-image]: https://coveralls.io/repos/github/arobson/haberdasher/badge.svg?branch=main
[version-image]: https://img.shields.io/npm/v/haberdasher.svg?style=flat
[version-url]: https://www.npmjs.com/package/haberdasher
[downloads-image]: https://img.shields.io/npm/dm/haberdasher.svg?style=flat
[downloads-url]: https://www.npmjs.com/package/haberdasher
