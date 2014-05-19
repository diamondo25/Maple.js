var mapleSocket = require('../net/socket.js'),
	wait = require('wait.for');
global.Server = exports.Server = function Server(pName, pPort, pVersion, pSubversion, pLocale) {
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
		pSocket.server = this.mapleServer;
		pSocket.server.connectedClients.push(pSocket);
		
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
					var handler = this.server.packetHandler.GetHandler(reader.ReadUInt16());
					wait.launchFiber(handler, pSocket, reader);
				}
				
				pSocket.header = !pSocket.header;
			}
			
			pSocket.resume();
		});
		pSocket.on('close', function () {
			console.log('Connection closed.');
			pSocket.server.connectedClients.pop(this);
		});
		pSocket.on('error', function () {
			console.log('Error?');
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
		pSocket.ponged = true;
	});

	this.tcpServer.listen(pPort);
	console.log('Waiting for people on port ' + pPort + '...');
};

exports.Server.prototype = {
	InitializePacketHandlers: function (pDirectory) {
		console.log('Loading packet handlers...');
		global.PacketHandler = this.packetHandler;
		
		require('fs').readdirSync('./packet_handlers/' + pDirectory).forEach(function (pFileName) {
			var curAmount = PacketHandler.GetHandlerCount();
			require('../packet_handlers/' + pDirectory + '/' + pFileName);
			console.log(' - Packet handlers in ' + pFileName + ' loaded (amount: ' + (PacketHandler.GetHandlerCount() - curAmount) + ')');
		});

		global.PacketHandler = null;
	}

};