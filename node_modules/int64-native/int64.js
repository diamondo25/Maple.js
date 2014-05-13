var path = require('path');

var modulePath = path.join(__dirname, 'build', 'Release', 'Int64');
module.exports = require(modulePath).Int64;
