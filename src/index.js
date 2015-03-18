var rb = require( 'redblack.js' );
var murmurhash = require( 'murmurhash3' );
var lift = require( 'when/node' ).lift;
var hash32 = lift( murmurhash.murmur32 );
var when = require( 'when' );
var _ = require( 'lodash' );

function addNode( state, tree, count, id, value ) {
	return addVirtualNodes( tree, id, value, count )
		.then( function( keys ) {
			state.keys[ id ] = keys;
			return keys;
		} );
}

function addVirtualNodes( tree, id, value, count ) {
	var list = [];
	var range = _.range( 0, count );
	var promises = _.map( range, function( i ) {
		var key = [ id, i ].join( ':' );
		return hash32( key )
			.then( function( hashed ) {
				tree.add( hashed, value );
				list.push( hashed );
				return hashed;
			} );
	} );
	return when.all( promises );
}

function get( tree, id ) {
	return hash32( id.toString() )
		.then( function( key ) {
			return tree.nearest( key );
		} )
}

function removeNode( state, tree, id ) {
	var keys = state.keys[ id ];
	_.each( keys, function( key ) {
		tree.remove( key );
	} );
	delete state.keys[ id ];
}

module.exports = function( virtualNodes ) {
	virtualNodes = virtualNodes || 100;
	var tree = rb();
	var state = {
		keys: {}
	};

	return {
		add: addNode.bind( undefined, state, tree, virtualNodes ),
		get: get.bind( undefined, tree ),
		getKeys: function() {
			return _.keys( state.keys );
		},
		countKeys: function() {
			return _.keys( state.keys ).length;
		},
		countNodes: function() {
			return tree.count();
		},
		logTree: function() {
			tree.root.log();
		},
		remove: removeNode.bind( undefined, state, tree )
	}
};
