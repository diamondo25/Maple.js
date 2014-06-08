
if (process.argv.length != 6) {
	console.log('Please run the instance with arguments');
	process.exit(1);
}

var config = {
	instanceName: process.argv[2],
	port: process.argv[3],
	worldId: process.argv[4],
	channelId: process.argv[5],
};

global.ServerConfig = require('./config.json');
global.PacketWriter = require('./net/PacketWriter.js');
global.PacketReader = require('./net/PacketReader.js');
global.Mongoose = require('mongoose');
global.wait = require('wait.for');

require('./helpers.js');
var nx = require('nx-parser');

console.log('Starting Maple.js ChannelServer (V' + ServerConfig.version + '.' + ServerConfig.subversion + ', ' + ServerConfig.locale + ')...');
console.log('World ID: ' + config.worldId + ', Channel ID: ' + config.channelId);

console.log('Establishing MongoDB connection...');
Mongoose.connect(ServerConfig.databaseConnectionString);

console.log('Loading JavaScript objects...');

global.DataFiles = {
	character: new nx.file('./datafiles/Character.nx'),
	item: new nx.file('./datafiles/Item.nx'),
	string: new nx.file('./datafiles/String.nx'),
	map: new nx.file('./datafiles/Map.nx'),
	mob: new nx.file('./datafiles/Mob.nx'),
	skill: new nx.file('./datafiles/Skill.nx'),
	reactor: new nx.file('./datafiles/Reactor.nx'),
	etc: new nx.file('./datafiles/Etc.nx'),
};

forAllFiles('./objects', '*.js', function (path, fileName) {
	console.log(' - Loading ' + fileName + '...');
	require(path);
	console.log(' - Objects in ' + fileName + ' loaded');
});

forAllFiles('./objects/channel_server', '*.js', function (path, fileName) {
	require(path);
	console.log(' - Objects in ' + fileName + ' loaded');
});

console.log('Loading Scripts...');
forAllFiles('./datafiles/scripts', '*.js', function (path, fileName) {
	require(path);
});

var Server = require('./net/Server.js');

var server = new Server(config.instanceName, config.port, ServerConfig.version, ServerConfig.subversion, ServerConfig.locale);
server.initializePacketHandlers('channelserver');

server.channelId = config.channelId;
server.worldId = config.worldId;

server.startPinger();


process.on('SIGINT', function() {
	server.Close();
	console.log('TERMINATE');
	process.exit();
});

// Extra methods


global.isInvalidTickCount = function (client, category, newTickCount) {
	if (client.lastTickCount !== -1) {
		if (client.lastTickCount > newTickCount) {
			client.disconnect('Tickcount reverted?! (Category: ' + category + ')');
			return true;
		}
	}

	client.lastTickCount = newTickCount;
	return false;
};