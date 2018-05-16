## haberdasher

A consistent-hash ring based on farmhash and redblack.js.

The expectation is that you will store key/values but look them up by another value that you want an evenly random distributions across.

It also includes a hashed queue implementation to shard tasks across queues so that you can guarantee mutual exclusion of asynchronous task execution based on id.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Version npm][version-image]][version-url]
[![npm Downloads][downloads-image]][downloads-url]
[![Dependencies][dependencies-image]][dependencies-url]

## Concepts

haberdasher uses a red-black tree to keep insert, lookup, and delete operations O(log n). It defaults to 100 virtual nodes per key/value pair inserted into the ring. The more virtual nodes you use per key, the more evenly distributed gets will be across key/value pairs. The trade-off will be slightly slower access times.

haberdasher uses farmhash to hash keys quickly and with little-to-no collision. In practicality, in the unlikely event collisions do occur they have impercetible impact on distribution.

Keys should be strings or numbers. Values can be anything you would like statistically even distribution across.

## Use Cases

Sharding is the most common application I have for this module. Because I often use this to shard tasks across possible asyncronous runners without collision, this module includes an implementation of a work queue that will prevent parallel execution of asynchronous tasks against the same id.

## Use

### Hashring

```javascript
const ring = require('haberdasher').ring;

// create a hash ring with 100 vnodes per key
const hash = ring.create();

// create a hash ring with custom number of vnodes per key
const hash2 = ring.create(1000);
```

### Hashqueue

```javascript
const queue = require('haberdasher').queue;
const tasks = queue.create(2); // number of queues

// no more than 2 tasks will run at any one time
// tasks will be mapped to worker queue based on the hash of their id
Promise.all([
  tasks.add(1, function() { console.log( 1 ); }),
  tasks.add(2, function() { console.log( 2 ); }),
  tasks.add(3, function() { console.log( 3 ); }),
  tasks.add(4, function() { console.log( 4 ); })
])
.then(results => {
  // results will be empty since the tasks aren't returning anything
});
```

## Hashring API

The API is very simple. Add and get operations return synchronously thanks to farmhash's simple API.

### `add(key, value)`

Add a key/value pair to the hash.

```javascript

hash.add('key1', { name: 'one' });
hash.add('key2', { name: 'one' });
hash.add('key3', { name: 'one' });
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

## Hashqueue API

### `create(concurrencyLimit)`

Creates a new hashqueue with the specified concurrency limit. The default limit is 4. Higher limits are better as the set of ids increase. Long-running tasks can slow things down, especially with lower limits.

```javascript
const queue = hashqueue.create(2);
```

### `add(id, task)`

Add a task to the queue. Returns a promise that will resolve to the value returned from the task when the task has completed.

> IMPORTANT: A promise __must__ be returned from tasks that are asynchronous.

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

## Note About The Name

Yes, a haberdasher has nothing to do with hashing or computers. My grandfather was a haberdasher and it's just a fun word to say. Given it's rare use in our language, I wasn't worried that anyone would think that I'd created a module that tailored/sold upscale men's clothing.

[travis-image]: https://travis-ci.org/arobson/haberdasher.svg?branch=master
[travis-url]: https://travis-ci.org/arobson/haberdasher
[coveralls-url]: https://coveralls.io/github/arobson/haberdasher?branch=master
[coveralls-image]: https://coveralls.io/repos/github/arobson/haberdasher/badge.svg?branch=master
[version-image]: https://img.shields.io/npm/v/haberdasher.svg?style=flat
[version-url]: https://www.npmjs.com/package/haberdasher
[downloads-image]: https://img.shields.io/npm/dm/haberdasher.svg?style=flat
[downloads-url]: https://www.npmjs.com/package/haberdasher
[dependencies-image]: https://img.shields.io/david/arobson/haberdasher.svg?style=flat
[dependencies-url]: https://david-dm.org/arobson/haberdasher
