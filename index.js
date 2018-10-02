'use strict';
let nodeMajorVersion = parseInt(process.version.match(/([0-9]+)\./)[1]);
if (nodeMajorVersion <= 7) {
  module.exports = require('./target/node6');
} else if (nodeMajorVersion <= 9) {
  module.exports = require('./target/node8');
} else {
  module.exports = require('./target/node10');
}
