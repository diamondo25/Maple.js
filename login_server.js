if (process.argv.length != 4) {
	console.log('Please run the instance with arguments');
	process.exit(1);
}

var config = {
	instanceName: process.argv[2],
	port: process.argv[3]
};


global.ServerConfig = require('./config.json');
global.PacketWriter = require('./net/PacketWriter.js').PacketWriter;
global.PacketReader = require('./net/PacketReader.js').PacketReader;
global.Mongoose = require('mongoose');

require('./helpers.js');
var nx = require('nx-parser');

console.log('Starting Maple.js LoginServer (V' + ServerConfig.version + '.' + ServerConfig.subversion + ', ' + ServerConfig.locale + ')...');

console.log('Connecting with the Database...');
Mongoose.connect(ServerConfig.databaseConnectionString);

console.log('Loading JavaScript objects...');

global.DataFiles = {
	character: new nx.file('./datafiles/Character.nx'),
	item: new nx.file('./datafiles/Item.nx'),
	string: new nx.file('./datafiles/String.nx'),
	etc: new nx.file('./datafiles/Etc.nx'),
};

ForAllFiles('./objects', '*.js', function (pPath, pFileName) {
	require(pPath);
	console.log(' - Objects in ' + pFileName + ' loaded');
});

var Server = require('./net/Server.js');

var server = new Server(config.instanceName, config.port, ServerConfig.version, ServerConfig.subversion, ServerConfig.locale);
server.InitializePacketHandlers('loginserver');
server.StartPinger();

process.on('SIGINT', function() {
	server.Close();
	console.log('TERMINATE');
	process.exit();
});