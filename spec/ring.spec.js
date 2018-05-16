require('./setup');
const ring = require('../src/index').ring;

describe('Hash ring', function () {
  describe('with a single node', function () {
    var hash;
    before(function () {
      hash = ring.create();
      return hash.add('one', 1);
    });

    it('should create correct number of keys', function () {
      hash.countKeys().should.equal(1);
    });

    it('should create correct number of virtual nodes', function () {
      hash.countNodes().should.equal(100);
    });

    it('should return the same value consistently', function () {
      var results = _.map(_.range(0, 100), function (i) {
        return hash.get([ 'somethingOrOther', i ].join('-'));
      });
      var check = function (x) {
        return x === 1;
      };
      _.every(results, check).should.equal(true);
    });
  });

  describe('with multiple nodes', function () {
    var hash;
    var vnodes = 100;
    var totalVNodes = vnodes * 4;
    var reads = 1000;
    var deviation = (reads / 4) * 0.1;
    before(function () {
      hash = ring.create(vnodes);
      hash.add('one', 1);
      hash.add('two', 2);
      hash.add('three', 3);
      hash.add('four', 4);
    });

    it('should have correct keys', function () {
      hash.getKeys().should.eql([ 'one', 'two', 'three', 'four' ]);
    });

    it('should create correct number of keys', function () {
      hash.countKeys().should.equal(4);
    });

    it('should create correct number of virtual nodes', function () {
      hash.countNodes().should.equal(totalVNodes);
    });

    it('should retrieve values for non-string keys', function () {
      return hash.get(190).should.equal(4);
    });

    it('should return an even distribution of values', function () {
      var values = _.map(_.range(0, reads), function (i) {
        return hash.get([ 'somethingOrOther', i ].join('-'));
      });
      _.values(_.countBy(values)).should.have.deviation.lessThan(deviation);
    });

    describe('after removing keys', function () {
      before(function () {
        hash.remove('one');
        hash.remove('three');
      });

      it('should have correct keys', function () {
        hash.getKeys().should.eql([ 'two', 'four' ]);
      });

      it('should have correct number of keys', function () {
        hash.countKeys().should.equal(2);
      });

      it('should create correct number of virtual nodes', function () {
        hash.countNodes().should.equal(totalVNodes / 2);
      });

      it('should not return removed values', function () {
        var values = _.map(_.range(0, reads), function (i) {
          return hash.get([ 'somethingOrOther', i ].join('-'));
        });
        _.keys(_.countBy(values)).should.eql([ '2', '4' ]);
      });

      it('should return an even distribution of values', function () {
        var values = _.map(_.range(0, reads), function (i) {
          return hash.get([ 'somethingOrOther', i ].join('-'));
        });
        _.values(_.countBy(values)).should.have.deviation.lessThan((reads / 2) * 0.1);
      });
    });
  });
});
