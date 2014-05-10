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
	var packet = new PacketWriter();
	packet.writeUInt16(0x000A);
	
	packet.writeUInt8(0);
	packet.writeString('Scania');
	packet.writeUInt8(1);
	packet.writeString('EVENT LOL');
	packet.writeUInt16(100);
	packet.writeUInt16(100);
	packet.writeUInt8(0);
	
	var channels = 10;
	packet.writeUInt8(channels);
	for (var i = 1; i <= channels; i++) {
		packet.writeString('Scania-' + i);
		packet.writeUInt32(429);
		packet.writeUInt8(0);
		packet.writeUInt8(i - 1);
		packet.writeUInt8(0);
	}
	
	packet.writeUInt16(0);
	socket.sendPacket(packet);
	
	
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