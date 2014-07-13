PacketHandler.setHandler(0x0031, function (client, reader) {
	// Player chat
	if (!client.character) {
		client.disconnect('Trying to chat while not loaded.');
		return;
	}
	
	var text = reader.readString();
	var shouting = reader.readUInt8() !== 0;
	
	
	var packet = new PacketWriter(0x00A2);
	packet.writeUInt32(getDocumentId(client.character));
	packet.writeUInt8(client.account.isAdmin);
	packet.writeString(text);
	packet.writeUInt8(shouting);
	
	getMap(client.character.mapId).broadcastPacket(packet);
	
	var elements = text.split(' ');
	console.log(elements);
	switch (elements[0]) {
		case '!packet':
			
			packet = new PacketWriter();
			packet.writeHexString(elements.slice(1).join());
			client.sendPacket(packet);
			break;
			
		case '!map':
			if (elements.length < 2) {
				// TODO: Show message here...
				return;
			}
			
			var map = parseInt(elements[1], 10);
			packets.map.changeMap(client, map, 0);
			break;
	}
});