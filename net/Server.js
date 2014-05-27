var mapleSocket = require('./socket.js');
global.wait = require('wait.for');

module.exports = function Server(pName, pPort, pVersion, pSubversion, pLocale) {
	this.name = pName;
	this.packetHandler = require('../net/PacketHandler.js');
	this.connectedClients = [];
	
	this.tcpServer = require('net').createServer(function (pSocket) {
		console.log('Got connection!');
		
		pSocket.clientSequence = new Uint8Array([0, 1, 2, 3]);
		pSocket.serverSequence = new Uint8Array([4, 3, 2, 1]);
		pSocket.ponged = true;
		pSocket.header = true;
		pSocket.nextBlockLen = 4;
		pSocket.buffer = new Buffer(0);
		
		pSocket.client = {
			server: this.mapleServer,
			socket: pSocket
		};
		
		pSocket.client.server.connectedClients.push(pSocket);
		
		pSocket.client.SendPacket = function (pPacket) {
			var buffer = new Buffer(4);
			var socket = this.socket;
			mapleSocket.GenerateHeader(buffer, socket.serverSequence, pPacket.writtenData, -(ServerConfig.version + 1));
			socket.write(buffer);
			
			buffer = pPacket.GetBufferCopy();
			mapleSocket.EncryptData(buffer, socket.serverSequence);
			
			socket.serverSequence = mapleSocket.MorphSequence(socket.serverSequence);
			
			socket.write(buffer);
		};
		
		pSocket.client.Disconnect = function (pWhy) {
			if (arguments.length != 0) {
				console.log('Disconnecting client. Reason: ' + pWhy);
			}
			else {
				console.log('Disconnecting client.');
			}
			var socket = this.socket;
			
			socket.end();
			socket.destroy();
		};
		
		pSocket.on('data', function (pData) {
			pSocket.pause();
			var temp = pSocket.buffer;
			pSocket.buffer = Buffer.concat([temp, pData]);
			
			while (pSocket.nextBlockLen <= pSocket.buffer.length) {
				var readingBlock = pSocket.nextBlockLen;
				
				var data = pSocket.buffer;

				var block = new Buffer(pSocket.nextBlockLen);
				data.copy(block, 0, 0, block.length);
				pSocket.buffer = new Buffer(data.length - block.length);
				data.copy(pSocket.buffer, 0, block.length);
				
				
				if (pSocket.header) {
					pSocket.nextBlockLen = mapleSocket.GetLengthFromHeader(block);
				}
				else {
					pSocket.nextBlockLen = 4;
				
					mapleSocket.DecryptData(block, pSocket.clientSequence);
					pSocket.clientSequence = mapleSocket.MorphSequence(pSocket.clientSequence);
					
					var reader = new PacketReader(block);
					var handler = this.client.server.packetHandler.GetHandler(reader.ReadUInt16());
					try {
						wait.launchFiber(handler, pSocket.client, reader);
					}
					catch (exception) {
						console.error(exception, exception.stack);
					}
				}
				
				pSocket.header = !pSocket.header;
			}
			
			pSocket.resume();
		});
		
		pSocket.on('close', function () {
			console.log('Connection closed.');
			pSocket.client.server.connectedClients.pop(this);
		});
		pSocket.on('error', function (pError) {
			console.log('Error?');
			console.log(pError);
		});

		
		// Send handshake
		var packet = new PacketWriter();
		packet.WriteUInt16(2 + 2 + pSubversion.length + 4 + 4 + 1);
		packet.WriteUInt16(pVersion);
		packet.WriteString(pSubversion);
		packet.WriteBytes(pSocket.clientSequence);
		packet.WriteBytes(pSocket.serverSequence);
		packet.WriteUInt8(pLocale);
		
		pSocket.write(packet.GetBufferCopy());

	});
	this.tcpServer.mapleServer = this;

	
	console.log('Starting pinger');

	this.packetHandler.SetHandler(0x0018, function (pSocket, pReader) {
		pSocket.socket.ponged = true;
	});

	this.tcpServer.listen(pPort);
	console.log('Waiting for people on port ' + pPort + '...');
};

module.exports.prototype = {
	InitializePacketHandlers: function (pDirectory) {
		console.log('Loading packet handlers...');
		global.PacketHandler = this.packetHandler;
		
		require('fs').readdirSync('./packet_handlers/' + pDirectory).forEach(function (pFileName) {
			var curAmount = PacketHandler.GetHandlerCount();
			require('../packet_handlers/' + pDirectory + '/' + pFileName);
			console.log(' - Packet handlers in ' + pFileName + ' loaded (amount: ' + (PacketHandler.GetHandlerCount() - curAmount) + ')');
		});

		global.PacketHandler = null;
	},
	
	StartPinger: function () {
		if (!this.pingerId) return;
		
		this.pingerId = setInterval(function () {
			var clientsCopy = server.connectedClients.slice();
			var packet = new PacketWriter(0x0011);
			
			for (var i = 0; i < clientsCopy.length; i++) {
				try {
					var client = clientsCopy[i].client;
					if (client.ponged == false) {
						client.Disconnect('Ping timeout'); // Exterminate.
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
					clientsCopy[i].client.Disconnect('Server is closing.');
				}
				catch (ex) {
					console.log(ex);
				}
			}
		}
	}
};