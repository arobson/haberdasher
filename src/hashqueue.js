const ring = require('./hashring');

function addTask (hash, id, task) {
  const queue = hash.get(id.toString());
  return queue.push(task);
}

function createQueue () {
  let queue = [];
  return {
    list: queue,
    pending: undefined,
    push: function (task) {
      const item = {
        task: task,
        deferred: null
      };
      item.deferred = defer();
      if (this.pending) {
        this.pending.resolve(item);
        this.pending = undefined;
      } else {
        queue.push(item);
      }
      return item.deferred.promise;
    },
    pop: function () {
      if (queue.length) {
        return Promise.resolve(queue.pop());
      } else {
        this.pending = defer();
        return this.pending.promise;
      }
    }
  };
}

function defer () {
  const deferred = {
    resolve: null,
    reject: null,
    promise: null
  };
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

function looper (queue) {
  queue.pop()
    .then(function (item) {
      if (!item) {
        return Promise.resolve(undefined);
      } else {
        var result = item.task();
        if (result && result.then) {
          return result
            .then(function (x) {
              item.deferred.resolve(x);
              return item;
            });
        } else {
          item.deferred.resolve(result);
          return Promise.resolve(item);
        }
      }
    })
    .then(function () {
      if (!queue.stopped) {
        looper(queue);
      }
    });
}

function createHashQueue (limit) {
  limit = limit || 4;
  const hash = ring.create();
  const queues = [];
  const state = {
    add: addTask.bind(undefined, hash),
    hash: hash,
    queues: queues,
    stop: function () {
      this.stopped = true;
      this.queues.forEach(queue => {
        if (queue.pending) {
          queue.pending.resolve(undefined);
        }
      });
    },
    stopped: false
  };
  for (var i = 0; i < limit; i++) {
    let queue = queues[ i ] = createQueue();
    hash.add(i, queue);
    looper(queue);
  }
  return state;
}

module.exports = {
  create: createHashQueue
};
