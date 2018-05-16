const rb = require('redblack.js');
const hash32 = require('farmhash').hash32;

function addNode (state, tree, count, id, value) {
  state.keys[ id ] = addVirtualNodes(tree, id, value, count);
  return state.keys[ id ];
}

function addVirtualNodes (tree, id, value, count) {
  let list = [];
  for (let i = 0; i < count; i++) {
    const hash = hash32(`${id}:${i}`);
    tree.add(hash, value);
    list.push(hash);
  }
  return list;
}

function get (tree, id) {
  const hash = hash32(id.toString());
  return tree.nearest(hash);
}

function removeNode (state, tree, id) {
  const keys = state.keys[ id ];
  keys.forEach(key => {
    tree.remove(key);
  });
  delete state.keys[ id ];
}

function createRing (virtualNodes) {
  virtualNodes = virtualNodes || 100;
  const tree = rb();
  const state = {
    keys: {}
  };

  return {
    add: addNode.bind(undefined, state, tree, virtualNodes),
    get: get.bind(undefined, tree),
    getKeys: function () {
      return Object.keys(state.keys);
    },
    countKeys: function () {
      return Object.keys(state.keys).length;
    },
    countNodes: function () {
      return tree.count();
    },
    logTree: function () {
      tree.root.log();
    },
    remove: removeNode.bind(undefined, state, tree)
  };
}

module.exports = {
  create: createRing
};
