'use strict';
let nodeMajorVersion = parseInt(process.version.match(/([0-9]+)\./)[1]);
if (nodeMajorVersion <= 5) {
  module.exports = require('./target/node4');
} else if (nodeMajorVersion <= 7) {
  module.exports = require('./target/node6');
} else {
  module.exports = require('./target/node8');
}
