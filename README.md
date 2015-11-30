## haberdasher
A consistent-hash ring based on farmhash and redblack.js.

## Concepts
haberdasher uses a red-black tree to keep all operations O(log n). It defaults to 100 virtual nodes per key/value pair inserted into the ring. The more virtual nodes you use per key, the more evenly distributed gets will be across key/value pairs. The trade-off will be slightly slower access times.

haberdasher uses farmhash to hash keys quickly and with very low collision.

Keys should be strings or numbers. Values can be anything you would like statistically even distribution across.

## Use

```javascript
var hasher = require( 'haberdasher' );

// create a hash ring with 100 vnodes per key
var hash = hasher();

// create a hash ring with custom number of vnodes per key
var hash2 = hasher( 1000 );
````

## API
The API is very simple. Add and get operations return synchronously thanks to farmhash's simple API.

### add
Add a key/value pair to the hash.

```javascript
hash.add( 'key1', { name: 'one' } );
hash.add( 'key2', { name: 'one' } );
hash.add( 'key3', { name: 'one' } );
```

### get
Returns a value based on how the hashed key maps to the hash ring.

```javascript
var value = hash.get( 'bacon' );
```

### remove
Removes the key/value pair from the hash ring.

```javascript
hash.remove( 'key3' );
```

## Distribution
The default number of vnodes (100) seems adequate to provide a standard deviation of 10% across key/value pairs. This may vary depending on the number of reads and keys used during get operations.

## Rough performance numbers
Of course, YMMV dependening largely on the processor. On a 2.6 GHz core i7, it takes 18 microseconds (on average) to lookup a key in a hashring with 10,000 virtual nodes. (in this case a hash with 10 key value/pairs and 1000 vnodes each) This performance seems to hold steady under constant load.
