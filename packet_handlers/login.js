PacketHandler.SetHandler(0x0001, function (socket, packet) {
	console.log('LoginPacket');
	var username = packet.readString();
	var password = packet.readString();

	
	var packet = new global.PacketWriter();
	packet.writeUInt16(0x0000);
	
	packet.writeUInt32(0);
	packet.writeUInt16(0);
	packet.writeUInt32(1); // userid
	packet.writeUInt8(0);
	packet.writeUInt8(0x40);
	packet.writeUInt8(0);
	packet.writeUInt8(0);
	packet.writeString(username);
	packet.writeUInt8(0);
	packet.writeUInt8(0); // qban
	packet.writeUInt32(0); // qban time
	packet.writeUInt32(0); 
	
	packet.writeUInt32(0); // create time
	packet.writeUInt32(0);
	
	packet.writeUInt32(0);
	
	packet.writeUInt8(true);
	packet.writeUInt8(2);
	socket.sendPacket(packet);
	
});

PacketHandler.SetHandler(0x000B, function (socket, packet) {
	// Request worlds
	var packet;
	
	for (var worldName in ServerConfig.worlds) {
		var worldinfo = ServerConfig.worlds[worldName];
		packet = new PacketWriter();
		packet.writeUInt16(0x000A);
		
		packet.writeUInt8(worldinfo.id);
		packet.writeString(worldName);
		packet.writeUInt8(worldinfo.ribbon);
		packet.writeString(worldinfo.eventMessage);
		packet.writeUInt16(100); // EXP Rate
		packet.writeUInt16(100); // DROP Rate
		packet.writeUInt8(0);
		
		var channels = worldinfo.channels;
		packet.writeUInt8(channels);
		for (var i = 1; i <= channels; i++) {
			packet.writeString(worldName + '-' + i);
			packet.writeUInt32(429);
			packet.writeUInt8(worldinfo.id);
			packet.writeUInt8(i - 1);
			packet.writeUInt8(0);
		}
		
		packet.writeUInt16(worldinfo.dialogs.length);
		for (var i = 0; i < worldinfo.dialogs.length; i++) {
			var dialog = worldinfo.dialogs[i];
			packet.writeUInt16(dialog.x);
			packet.writeUInt16(dialog.y);
			packet.writeString(dialog.text);
		}
		socket.sendPacket(packet);
	}
	
	packet = new PacketWriter();
	packet.writeUInt16(0x000A);
	packet.writeUInt8(0xFF);
	
	socket.sendPacket(packet);
	
});

PacketHandler.SetHandler(0x0006, function (socket, packet) {
	// Request world state
	
	
	var packet = new PacketWriter();
	packet.writeUInt16(0x0003);
	packet.writeUInt8(0);
	packet.writeUInt8(0);
	
	socket.sendPacket(packet);
});