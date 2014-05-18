global.ServerConfig = require('./config.json');
var mapleSocket = require('./net/socket.js');
global.PacketWriter = require('./net/PacketWriter.js').PacketWriter;
global.PacketReader = require('./net/PacketReader.js').PacketReader;
global.PacketHandler = require('./net/PacketHandler.js');

require('./helpers.js');
nx = require('node-nx');
global.DataFiles = {
	character: new nx.file('C:\\WZS 2\\Character.nx'),
	items: new nx.file('C:\\WZS 2\\Item.nx'),
	map: new nx.file('C:\\WZS 2\\Map.nx'),
};

global.ConnectedClients = [];

var server = require('net').createServer(function (pSocket) {
	console.log('Got connection!');
	
	pSocket.clientSequence = new Uint8Array([0, 1, 2, 3]);
	pSocket.serverSequence = new Uint8Array([4, 3, 2, 1]);
	pSocket.ponged = true;
	pSocket.header = true;
	pSocket.nextBlockLen = 4;
	pSocket.buffer = '';
	ConnectedClients.push(pSocket);
	
	pSocket.SendPacket = function (pPacket) {
		var buffer = new Buffer(4);
		mapleSocket.GenerateHeader(buffer, this.serverSequence, pPacket.writtenData, -(ServerConfig.version + 1));
		this.write(buffer);
		
		buffer = pPacket.GetBufferCopy();
		mapleSocket.EncryptData(buffer, this.serverSequence);
		
		this.serverSequence = mapleSocket.MorphSequence(this.serverSequence);
		
		this.write(buffer);
	};
	
	pSocket.Disconnect = function () {
		this.end();
		this.destroy();
	};
	
	pSocket.on('data', function (pData) {
		pSocket.pause();
		pSocket.buffer += pData.toString('binary'); // There must be a better way for this
		
		while (pSocket.nextBlockLen <= pSocket.buffer.length) {
			var readingBlock = pSocket.nextBlockLen;
			
			HandleRawData(pSocket);
			pSocket.buffer = pSocket.buffer.substr(readingBlock);
		}
		
		pSocket.resume();
	});
	pSocket.on('close', function () {
		console.log('Connection closed.');
		ConnectedClients.pop(this);
	});
	pSocket.on('error', function () {
		console.log('Error?');
	});

	
	// Send handshake
	var packet = new PacketWriter();
	packet.WriteUInt16(2 + 2 + ServerConfig.subversion.length + 4 + 4 + 1);
	packet.WriteUInt16(ServerConfig.version);
	packet.WriteString(ServerConfig.subversion);
	packet.WriteBytes(pSocket.clientSequence);
	packet.WriteBytes(pSocket.serverSequence);
	packet.WriteUInt8(ServerConfig.locale);
	
	pSocket.write(packet.GetBufferCopy());

});


function HandleRawData(pSocket) {
	var data = new Buffer(pSocket.buffer, 'binary');

	var block = new Buffer(pSocket.nextBlockLen);
	data.copy(block);
	
	if (pSocket.header) {
		pSocket.nextBlockLen = mapleSocket.GetLengthFromHeader(block);
	}
	else {
		pSocket.nextBlockLen = 4;
	
		mapleSocket.DecryptData(block, pSocket.clientSequence);
		pSocket.clientSequence = mapleSocket.MorphSequence(pSocket.clientSequence);
		
		var reader = new PacketReader(block);
		PacketHandler.GetHandler(reader.ReadUInt16())(pSocket, reader);
	}
	
	pSocket.header = !pSocket.header;
}

console.log('Starting Maple.js Server (V' + ServerConfig.version + '.' + ServerConfig.subversion + ', ' + ServerConfig.locale + ')...');

console.log('Loading objects...');

require('fs').readdirSync('./objects').forEach(function (pFileName) {
	require('./objects/' + pFileName);
	console.log(' - Objects in ' + pFileName + ' loaded');
});

console.log('Loading packet handlers...');

require('fs').readdirSync('./packet_handlers').forEach(function (pFileName) {
	var curAmount = PacketHandler.GetHandlerCount();
	require('./packet_handlers/' + pFileName);
	console.log(' - Packet handlers in ' + pFileName + ' loaded (amount: ' + (PacketHandler.GetHandlerCount() - curAmount) + ')');
});


console.log('Starting pinger');

setInterval(function () {
	var clientsCopy = ConnectedClients.slice();
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
	var clientsCopy = ConnectedClients.slice();
	var i;
	for (i = 0; i < clientsCopy.length; i++) {
		try {
			clientsCopy[i].Disconnect();
		}
		catch (ex) {
			console.log(ex);
		}
	}
	console.log('Kicked ' + i + ' clients');
	console.log('TERMINATE');
	process.exit();
});

PacketHandler.SetHandler(0x0018, function (pSocket, pReader) {
	pSocket.ponged = true;
});

server.listen(ServerConfig.port);

console.log('Waiting for people on port ' + ServerConfig.port + '...');


var character = new Character();
character.RandomizeLook();
console.log(character);