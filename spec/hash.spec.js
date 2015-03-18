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

describe( 'Consistent hash', function() {
	describe( 'with a single node', function() {
		var hash;
		before( function() {
			hash = hasher();
			return hash.add( 'one', 1 );
		} );

		it( 'should create correct number of keys', function() {
			hash.countKeys().should.equal( 1 );
		} );

		it( 'should create correct number of virtual nodes', function() {
			hash.countNodes().should.equal( 100 );
		} );

		it( 'should return the same value consistently', function() {
			var promises = when.all( _.map( _.range( 0, 100 ), function( i ) {
				return hash.get( [ 'somethingOrOther', i ].join( '-' ) );
			} ) );
			var check = function( x ) {
				return x === 1;
			}
			return promises
				.then( function( values ) {
					_.all( values, check ).should.be.true;
				} );
		} );
	} );

	describe( 'with multiple nodes', function() {
		var hash;
		var vnodes = 100;
		var totalVNodes = vnodes * 4;
		var reads = 1000;
		var deviation = ( reads / 4 ) * .1;
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
				}
			] );
		} );

		it( 'should have correct keys', function() {
			hash.getKeys().should.eql( [ 'one', 'two', 'three', 'four' ] );
		} );

		it( 'should create correct number of keys', function() {
			hash.countKeys().should.equal( 4 );
		} );

		it( 'should create correct number of virtual nodes', function() {
			hash.countNodes().should.equal( totalVNodes );
		} );

		it( 'should return an even distribution of values', function() {
			var promises = when.all( _.map( _.range( 0, reads ), function( i ) {
				return hash.get( [ 'somethingOrOther', i ].join( '-' ) );
			} ) );
			return promises
				.then( function( values ) {
					return _.values( _.countBy( values ) );
				} ).should.eventually.have.deviation.lessThan( deviation );
		} );

		describe( 'after removing keys', function() {
			before( function() {
				hash.remove( 'one' );
				hash.remove( 'three' );
			} );

			it( 'should have correct keys', function() {
				hash.getKeys().should.eql( [ 'two', 'four' ] );
			} );

			it( 'should have correct number of keys', function() {
				hash.countKeys().should.equal( 2 );
			} );

			it( 'should create correct number of virtual nodes', function() {
				hash.countNodes().should.equal( totalVNodes / 2 );
			} );

			it( 'should not return removed values', function() {
				var promises = when.all( _.map( _.range( 0, reads ), function( i ) {
					return hash.get( [ 'somethingOrOther', i ].join( '-' ) );
				} ) );
				return promises
					.then( function( values ) {
						return _.keys( _.countBy( values ) );
					} ).should.eventually.deep.equal( [ '2', '4' ] );
			} );

			it( 'should return an even distribution of values', function() {
				var promises = when.all( _.map( _.range( 0, reads ), function( i ) {
					return hash.get( [ 'somethingOrOther', i ].join( '-' ) );
				} ) );
				return promises
					.then( function( values ) {
						return _.values( _.countBy( values ) );
					} ).should.eventually.have.deviation.lessThan( ( reads / 2 ) * .1 );
			} );
		} );
	} );
} );
