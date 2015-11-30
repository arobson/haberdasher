var rb = require( 'redblack.js' );
var hash32 = require( 'farmhash' ).hash32;
var _ = require( 'lodash' );

function addNode( state, tree, count, id, value ) {
	var keys = addVirtualNodes( tree, id, value, count );
	state.keys[ id ] = keys;
	return keys;
}

function addVirtualNodes( tree, id, value, count ) {
	var list = [];
	var range = _.range( 0, count );
	return _.map( range, function( i ) {
		var key = [ id, i ].join( ':' );
		var hash = hash32( key );
		tree.add( hash, value );
		list.push( hash );
		return hash;
	} );
}

function get( tree, id ) {
	var hash = hash32( id.toString() );
	return tree.nearest( hash );
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
	};
};
