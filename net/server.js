var mapleSocket = require('./socket.js'),
	crypto = require('crypto');
global.wait = require('wait.for');

require('./../helpers.js');

var Server = function Server(name, port, version, subversion, locale) {
	this.name = name;
	this.packetHandler = require('../net/PacketHandler.js');
	this.connectedClients = [];
	
	this.tcpServer = require('net').createServer(function (socket) {
		console.log('Got connection!');
		
		socket.clientSequence = new Uint8Array(crypto.randomBytes(4));
		socket.serverSequence = new Uint8Array(crypto.randomBytes(4));
		socket.ponged = true;
		socket.header = true;
		socket.nextBlockLen = 4;
		socket.buffer = new Buffer(0);
		
		socket.client = {
			server: this.mapleServer,
			socket: socket
		};
		
		socket.client.server.connectedClients.push(socket);
		
		socket.client.sendPacket = function (packet) {
			var buffer = new Buffer(4);
			var socket = this.socket;
			mapleSocket.generateHeader(buffer, socket.serverSequence, packet.writtenData, -(version + 1));
			socket.write(buffer);
			
			buffer = packet.getBufferCopy();
			mapleSocket.encryptData(buffer, socket.serverSequence);
			
			socket.serverSequence = mapleSocket.morphSequence(socket.serverSequence);
			
			socket.write(buffer);
		};
		
		socket.client.disconnect = function (reason) {
			if (arguments.length !== 0) {
				console.log('Disconnecting client. Reason: ' + reason);
			}
			else {
				console.log('Disconnecting client.');
			}
			var socket = this.socket;
			
			socket.end();
			socket.destroy();
		};
		
		socket.on('data', function (receivedData) {
			socket.pause();
			var temp = socket.buffer;
			socket.buffer = Buffer.concat([temp, receivedData]);
			
			while (socket.nextBlockLen <= socket.buffer.length) {
				var readingBlock = socket.nextBlockLen;
				
				var data = socket.buffer;

				var block = new Buffer(socket.nextBlockLen);
				data.copy(block, 0, 0, block.length);
				socket.buffer = new Buffer(data.length - block.length);
				data.copy(socket.buffer, 0, block.length);
				
				
				if (socket.header) {
					socket.nextBlockLen = mapleSocket.getLengthFromHeader(block);
				}
				else {
					socket.nextBlockLen = 4;
				
					mapleSocket.decryptData(block, socket.clientSequence);
					socket.clientSequence = mapleSocket.morphSequence(socket.clientSequence);
					
					var reader = new PacketReader(block);
					var handler = this.client.server.packetHandler.getHandler(reader.readUInt16());
					try {
						wait.launchFiber(handler, socket.client, reader);
					}
					catch (exception) {
						console.error(exception, exception.stack);
					}
				}
				
				socket.header = !socket.header;
			}
			
			socket.resume();
		});
		
		socket.on('close', function () {
			console.log('Connection closed.');
			socket.client.server.connectedClients.pop(this);
		});
		socket.on('error', function (error) {
			console.log('Error?');
			console.log(error);
		});

		
		// Send handshake
		var packet = new PacketWriter();
		packet.writeUInt16(2 + 2 + subversion.length + 4 + 4 + 1);
		packet.writeUInt16(version);
		packet.writeString(subversion);
		packet.writeBytes(socket.clientSequence);
		packet.writeBytes(socket.serverSequence);
		packet.writeUInt8(locale);
		
		socket.write(packet.getBufferCopy());

	});
	this.tcpServer.mapleServer = this;

	
	console.log('Starting pinger');

	this.packetHandler.setHandler(0x0018, function (socket, reader) {
		socket.socket.ponged = true;
	});

	this.tcpServer.listen(port);
	console.log('Waiting for people on port ' + port + '...');
};

Server.prototype = {
	initializePacketHandlers: function (directory) {
		console.log('Loading packet handlers...');
		global.PacketHandler = this.packetHandler;
		forAllFiles(process.cwd() + '/packet_handlers/' + directory, '*.js', function (fileName) {
			console.log(fileName);
			var curAmount = PacketHandler.getHandlerCount();
			require(fileName);
			console.log(' - Packet handlers in ' + fileName + ' loaded (amount: ' + (PacketHandler.getHandlerCount() - curAmount) + ')');
		});

		global.PacketHandler = null;
	},
	
	startPinger: function () {
		if (!this.pingerId) return;
		
		this.pingerId = setInterval(function () {
			var clientsCopy = server.connectedClients.slice();
			var packet = new PacketWriter(0x0011);
			
			for (var i = 0; i < clientsCopy.length; i++) {
				try {
					var client = clientsCopy[i].client;
					if (client.ponged === false) {
						client.disconnect('Ping timeout'); // Exterminate.
						continue;
					}
					client.ponged = false;
					client.sendPacket(packet);
				}
				catch (ex) {
					console.log(ex);
				}
			}
		}, 15000);
	
	},
	
	Close: function () {
		if (this.pingerId) {
			clearInterval(this.pingerId);
			this.pingerId = null;
		}
		if (this.tcpServer) {
			this.tcpServer.close();
			this.tcpServer = null;

			var clientsCopy = this.connectedClients.slice();
			for (var i = 0; i < clientsCopy.length; i++) {
				try {
					clientsCopy[i].client.disconnect('Server is closing.');
				}
				catch (ex) {
					console.log(ex);
				}
			}
		}
	}
};

module.exports = Server;