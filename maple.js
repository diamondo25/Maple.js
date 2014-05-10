var serverConfig = require('./config.json');

var net = require('net');
var mapleSocket = require('./net/socket.js');
global.PacketWriter = require('./net/PacketWriter.js').PacketWriter;
global.PacketReader = require('./net/PacketReader.js').PacketReader;
global.PacketHandler = require('./net/PacketHandler.js');


var server = net.createServer(function (socket) {
	socket.clientIV = new Uint8Array([0, 1, 2, 3]);
	socket.serverIV = new Uint8Array([4, 3, 2, 1]);
	socket.header = true;
	socket.nextBlockLen = 4;
	socket.buffer = '';
	
	socket.sendPacket = function (packet) {
		var buffer = new Buffer(packet.writtenData + 4);
		
		mapleSocket.generateHeader(buffer, this.serverIV, packet.writtenData, -(serverConfig.version + 1));
		
		var copyData = new Buffer(packet.writtenData);
		packet.buffer.copy(copyData);
		mapleSocket.encryptData(copyData, this.serverIV);
		this.serverIV = mapleSocket.recalculateIV(this.serverIV);
		
		copyData.copy(buffer, 4);
		console.log(buffer);
		this.write(buffer);
	};
	
	console.log('Got connection!');
	
	
	socket.on('data', function (data) {
		socket.pause();
		socket.buffer += data.toString('binary');
		
		while (socket.nextBlockLen <= socket.buffer.length) {
			var readingBlock = socket.nextBlockLen;
			
			HandleRawData(socket);
			socket.buffer = socket.buffer.substr(readingBlock);
		}
		
		socket.resume();
	});
	socket.on('close', function () {
		console.log('Connection closed.');
	});
	socket.on('error', function () {
		console.log('Error?');
	});

	
	{
		// Send handshake
		var packet = new PacketWriter();
		packet.writeUInt16(2 + 2 + serverConfig.subversion.length + 4 + 4 + 1);
		packet.writeUInt16(serverConfig.version);
		packet.writeString(serverConfig.subversion);
		packet.writeBytes(socket.clientIV);
		packet.writeBytes(socket.serverIV);
		packet.writeUInt8(serverConfig.locale);
		
		socket.write(packet.getData());
		
	}
});


function HandleRawData(socket) {
	var data = new Buffer(socket.buffer, 'binary');

	var block = new Buffer(socket.nextBlockLen);
	data.copy(block);
	
	if (socket.header) {
		socket.nextBlockLen = mapleSocket.getLengthFromHeader(block);
	}
	else {
		socket.nextBlockLen = 4;
	
		mapleSocket.decryptData(block, socket.clientIV);
		socket.clientIV = mapleSocket.recalculateIV(socket.clientIV);
		
		var reader = new PacketReader(block);
		PacketHandler.GetHandler(reader.readUInt16())(socket, reader);
	}
	
	socket.header = !socket.header;
}

console.log('Starting Maple.js Server (V' + serverConfig.version + '.' + serverConfig.subversion + ', ' + serverConfig.locale + ')...');

console.log('Loading packet handlers...');

require('fs').readdirSync('./packet_handlers').forEach(function(file) {
	if (file.lastIndexOf('.js') != file.length - 3) return;
	console.log('Loading ' + file);
	require('./packet_handlers/' + file);
});

server.listen(serverConfig.port);

console.log('Waiting for people on port ' + serverConfig.port + '...');
