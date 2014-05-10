global.ServerConfig = require('./config.json');

var mapleSocket = require('./net/socket.js');
global.PacketWriter = require('./net/PacketWriter.js').PacketWriter;
global.PacketReader = require('./net/PacketReader.js').PacketReader;
global.PacketHandler = require('./net/PacketHandler.js');


var server = require('net').createServer(function (socket) {
	socket.clientSequence = new Uint8Array([0, 1, 2, 3]);
	socket.serverSequence = new Uint8Array([4, 3, 2, 1]);
	socket.header = true;
	socket.nextBlockLen = 4;
	socket.buffer = '';
	
	socket.sendPacket = function (packet) {
		// TODO: Clean up...
		var buffer = new Buffer(packet.writtenData + 4);
		
		mapleSocket.generateHeader(buffer, this.serverSequence, packet.writtenData, -(ServerConfig.version + 1));
		
		var copyData = new Buffer(packet.writtenData);
		packet.buffer.copy(copyData);
		mapleSocket.encryptData(copyData, this.serverSequence);
		this.serverSequence = mapleSocket.recalculateIV(this.serverSequence);
		
		copyData.copy(buffer, 4);
		this.write(buffer);
	};
	
	console.log('Got connection!');
	
	
	socket.on('data', function (data) {
		socket.pause();
		socket.buffer += data.toString('binary'); // There must be a better way for this
		
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

	
	// Send handshake
	var packet = new PacketWriter();
	packet.writeUInt16(2 + 2 + ServerConfig.subversion.length + 4 + 4 + 1);
	packet.writeUInt16(ServerConfig.version);
	packet.writeString(ServerConfig.subversion);
	packet.writeBytes(socket.clientSequence);
	packet.writeBytes(socket.serverSequence);
	packet.writeUInt8(ServerConfig.locale);
	
	socket.write(packet.getData());

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
	
		mapleSocket.decryptData(block, socket.clientSequence);
		socket.clientSequence = mapleSocket.recalculateIV(socket.clientSequence);
		
		var reader = new PacketReader(block);
		PacketHandler.GetHandler(reader.readUInt16())(socket, reader);
	}
	
	socket.header = !socket.header;
}

console.log('Starting Maple.js Server (V' + ServerConfig.version + '.' + ServerConfig.subversion + ', ' + ServerConfig.locale + ')...');

console.log('Loading packet handlers...');

require('fs').readdirSync('./packet_handlers').forEach(function(file) {
	if (file.lastIndexOf('.js') != file.length - 3) return;
	console.log('Loading ' + file);
	require('./packet_handlers/' + file);
});

server.listen(ServerConfig.port);

console.log('Waiting for people on port ' + ServerConfig.port + '...');
