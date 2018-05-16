const chai = require('chai');
const chaiStats = require('chai-stats');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiStats);
chai.use(chaiAsPromised);
chai.should();

global._ = require('lodash');
global.seq = require('when/sequence');
global.prettyTime = require('pretty-hrtime');
