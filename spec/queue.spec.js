const queue = require('../src/index').queue;

let state = {};
let inUse = {};
function read (id) {
  if (inUse[ id ]) {
    return Promise.reject(new Error('Concurrent access violation!'));
  } else {
    inUse[ id ] = true;
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(state[ id ]);
      }, 10);
    });
  }
}

function reset () {
  inUse = {};
  state = {};
}

function write (id, val) {
  if (!inUse[ id ]) {
    return Promise.reject(new Error('Don\'t go changing things all willy-nilly!'));
  } else {
    return new Promise(resolve => {
      setTimeout(() => {
        state[ id ] = val;
        inUse[ id ] = false;
        resolve(val);
      }, 10);
    });
  }
}

function createTask (id) {
  return function () {
    return read(id)
      .then(thing => {
        return write(id, thing);
      });
  };
}

describe('Hash queue', function () {
  describe('without queue', function () {
    describe('With a single id', function () {
      let err;
      before(function () {
        const tasks = [
          createTask(1),
          createTask(1),
          createTask(1)
        ];
        const promises = _.map(tasks, t => {
          return t().catch(e => {
            err = e;
          });
        });
        return Promise.all(promises);
      });

      it('should result in an exception', function () {
        err.message.should.equal('Concurrent access violation!');
      });

      after(function () {
        reset();
      });
    });
  });

  describe('with queue', function () {
    describe('With a single id', function () {
      let err;
      let hq;
      before(function () {
        hq = queue.create();
        const promises = [
          hq.add(1, createTask(1)),
          hq.add(1, createTask(1)),
          hq.add(1, createTask(1))
        ];
        return Promise.all(promises);
      });

      it('should not result in an exception', function () {
        (err === undefined).should.equal(true);
      });

      after(function () {
        hq.stop();
        reset();
      });
    });

    describe('With task results', function () {
      let results;
      let hq;
      before(function () {
        hq = queue.create();
        const promises = [
          hq.add(1, () => {
            return 1;
          }),
          hq.add(1, () => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(2);
              }, 10);
            });
          }),
          hq.add(1, () => {
            return Promise.resolve(3);
          })
        ];
        return Promise.all(promises).then(x => {
          results = x;
        });
      });

      it('should produce expected results', function () {
        results.should.eql([ 1, 2, 3 ]);
      });

      after(function () {
        hq.stop();
        reset();
      });
    });
  });
});
