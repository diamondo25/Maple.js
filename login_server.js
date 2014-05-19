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
};

require('fs').readdirSync('./objects').forEach(function (pFileName) {
	require('./objects/' + pFileName);
	console.log(' - Objects in ' + pFileName + ' loaded');
});

var server = new Server(config.instanceName, config.port, ServerConfig.version, ServerConfig.subversion, ServerConfig.locale);
server.InitializePacketHandlers('loginserver');

setInterval(function () {
	var clientsCopy = server.connectedClients.slice();
	var packet = new PacketWriter(0x0011);
	
	for (var i = 0; i < clientsCopy.length; i++) {
		try {
			var client = clientsCopy[i];
			if (client.ponged == false) {
				console.log('Terminated client');
				client.Disconnect(); // Exterminate.
				continue;
			}
			client.ponged = false;
			client.SendPacket(packet);
		}
		catch (ex) {
			console.log(ex);
		}
	}
}, 15000);

process.on('SIGINT', function() {
	var clientsCopy = server.connectedClients.slice();
	var i;
	for (i = 0; i < clientsCopy.length; i++) {
		try {
			clientsCopy[i].Disconnect();
		}
		catch (ex) {
			console.log(ex);
		}
	}
	console.log('Kicked ' + i);
	console.log('TERMINATE');
	process.exit();
});