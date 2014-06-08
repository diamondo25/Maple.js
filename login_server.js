if (process.argv.length != 4) {
	console.log(process.argv);
	console.log('Please run the instance with arguments');
	process.exit(1);
}

var config = {
	instanceName: process.argv[2],
	port: process.argv[3]
};


global.ServerConfig = require('./config.json');
global.PacketWriter = require('./net/PacketWriter.js');
global.PacketReader = require('./net/PacketReader.js');
global.Mongoose = require('mongoose');

require('./helpers.js');
var nx = require('nx-parser');

console.log('Starting Maple.js LoginServer (V' + ServerConfig.version + '.' + ServerConfig.subversion + ', ' + ServerConfig.locale + ')...');

console.log('Establishing MongoDB connection...');
Mongoose.connect(ServerConfig.databaseConnectionString);

console.log('Loading JavaScript objects...');

global.DataFiles = {
	character: new nx.file('./datafiles/Character.nx'),
	item: new nx.file('./datafiles/Item.nx'),
	string: new nx.file('./datafiles/String.nx'),
	etc: new nx.file('./datafiles/Etc.nx'),
};

forAllFiles('./objects', '*.js', function (path, fileName) {
	require(path);
	console.log(' - Objects in ' + fileName + ' loaded');
});

var Server = require('./net/Server.js');

var server = new Server(config.instanceName, config.port, ServerConfig.version, ServerConfig.subversion, ServerConfig.locale);
server.initializePacketHandlers('loginserver');
server.startPinger();

process.on('SIGINT', function() {
	server.close();
	console.log('TERMINATE');
	process.exit();
});
