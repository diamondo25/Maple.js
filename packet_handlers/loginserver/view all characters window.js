function sendCharacters(client, worldId, characters) {
	var packet = new PacketWriter(0x0008);
	packet.writeUInt8(0);

	packet.writeUInt8(worldId);	
	packet.writeUInt8(characters.length);
	
	for (var i = 0; i < characters.length; i++) {
		var character = characters[i];
		
		character.addStats(packet);
		character.addAvatar(packet);
		
		packet.writeUInt8(false);
	}
	
	
	client.sendPacket(packet);
}

PacketHandler.setHandler(0x000D, function (client, reader) {
	// View all characters (clicked VAC button)

	if (!client.account) {
		client.disconnect('Trying to view all characters while not loggedin');
		return;
	}

	var worldInConfig = ServerConfig.worlds;
	var worlds = {};
	var worldId;
	for (var worldName in worldInConfig) {
		worldId = worldInConfig[worldName].id;
		worlds[worldId] = client.account.getCharacters(worldId);
	}

	
	
	var packet = new PacketWriter(0x0008);
	packet.writeUInt8(1);

	var totalCharacters = 0;
	for (worldId in worlds) {
		totalCharacters += worlds[worldId].length;
	}
	
	packet.writeUInt32(totalCharacters);
	packet.writeUInt32(totalCharacters + (3 - totalCharacters % 3));
	
	client.sendPacket(packet);
	
	
	
	for (worldId in worlds) {
		if (worlds[worldId].length === 0) continue;
		sendCharacters(client, worldId, worlds[worldId]);
	}
});


function enterChannel(client, characterId, worldId) {
	var world = getWorldInfoById(worldId);
	var channel = (world.channels * Math.random()) >>> 0;
	
	// Remote-hack vulnerable
	var packet = new PacketWriter(0x000C);
	packet.writeUInt16(0);
	packet.writeBytes(ipStringToBytes(world.publicIP));
	packet.writeUInt16(world.portStart + channel);
	packet.writeUInt32(characterId);
	packet.writeUInt8(0); // Flag bit 1 set = korean popup?
	packet.writeUInt32(0); // Minutes left on Internet Cafe?
	
	client.sendPacket(packet);
}

PacketHandler.setHandler(0x0020, function (client, reader) {
	// Select VAC character with PIC
	if (!client.account) {
		client.disconnect('Trying to select character in VAC window (PIC) while not loggedin');
		return;
	}
	
	var pic = reader.readString();
	var characterId = reader.readUInt32();
	var worldId = reader.readUInt32();
	var macAddresses = reader.readString();
	var deviceUID = reader.readString();
	
	enterChannel(client, characterId, worldId); // Todo: Add check if the character is in this world AND from the same account
});

PacketHandler.setHandler(0x000E, function (client, reader) {
	// Select VAC character without PIC
	if (!client.account) {
		client.disconnect('Trying to select character in VAC window while not loggedin');
		return;
	}
	
	var characterId = reader.readUInt32();
	var worldId = reader.readUInt32();
	var macAddresses = reader.readString();
	var deviceUID = reader.readString();
	
	enterChannel(client, characterId, worldId); // Todo: Add check if the character is in this world AND from the same account
});