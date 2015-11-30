var chai = require( 'chai' );
var chaiStats = require( 'chai-stats' );
var chaiAsPromised = require( 'chai-as-promised' );
chai.use( chaiStats );
chai.use( chaiAsPromised );
var should = chai.should();
var hasher = require( '../src/index' );
var _ = require( 'lodash' );
var when = require( 'when' );
var seq = require( 'when/sequence' );
var prettyTime = require( 'pretty-hrtime' );

describe( 'Boat racin\'!', function() {
	var vnodes = 1000;
	var totalVNodes = vnodes * 10;
	var reads = 10000;
	var deviation = ( reads / 10 ) * 0.1;
	describe( 'with 10 nodes and ' + vnodes + ' virtual nodes each', function() {
		var hash;

		before( function() {
			hash = hasher( vnodes );
			var start = process.hrtime();
			return seq( [ function() {
					return hash.add( 'one', 1 );
				}, function() {
					return hash.add( 'two', 2 );
				}, function() {
					return hash.add( 'three', 3 );
				}, function() {
					return hash.add( 'four', 4 );
				}, function() {
					return hash.add( 'five', 5 );
				}, function() {
					return hash.add( 'six', 6 );
				}, function() {
					return hash.add( 'seven', 7 );
				}, function() {
					return hash.add( 'eight', 8 );
				}, function() {
					return hash.add( 'nine', 9 );
				}, function() {
					return hash.add( 'ten', 10 );
				}
			] ).then( function() {
				var end = process.hrtime( start );
				console.log( 'Added', totalVNodes, ' virtual nodes in:', prettyTime( end, { precise: true } ) );
				return;
			} );
		} );

		it( 'should create correct number keys', function() {
			hash.countKeys().should.equal( 10 );
		} );

		it( 'should create correct number of virtual nodes', function() {
			hash.countNodes().should.equal( totalVNodes );
		} );

		it( 'should return an even distribution of values', function() {
			this.timeout( 10000 );
			var start = process.hrtime();
			var promises = when.all( _.map( _.range( 0, reads ), function( i ) {
				return hash.get( [ 'somethingOrOther', i ].join( '-' ) );
			} ) )
				.then( function( x ) {
					var end = process.hrtime( start );
					console.log( reads, 'lookups in:', prettyTime( end, { precise: true } ) );
					return x;
				} );
			return promises
				.then( function( values ) {
					var counts = _.values( _.countBy( values ) );
					console.log( 'distribution', counts );
					return counts;
				} ).should.eventually.have.deviation.lessThan( deviation );
		} );
	} );
} );
