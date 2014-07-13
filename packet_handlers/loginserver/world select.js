var showWorldsPacketHandler = function (client, reader) {
	// Request worlds
	
	if (!client.account) {
		client.disconnect('Trying to view worlds while not loggedin');
		return;
	}
	
	var packet;
	
	for (var worldName in ServerConfig.worlds) {
		var world = ServerConfig.worlds[worldName];
		packet = new PacketWriter(0x000A);
		
		packet.writeUInt8(world.id);
		packet.writeString(worldName);
		packet.writeUInt8(world.ribbon);
		packet.writeString(world.eventMessage);
		packet.writeUInt16(100); // EXP Rate
		packet.writeUInt16(100); // DROP Rate
		packet.writeUInt8(world.characterCreationDisabled);
		
		var channels = world.channels;
		packet.writeUInt8(channels);
		var i;
		for (i = 1; i <= channels; i++) {
			packet.writeString(worldName + '-' + i);
			packet.writeUInt32(13132); // Online players
			packet.writeUInt8(world.id);
			packet.writeUInt8(i - 1);
			packet.writeUInt8(0);
		}
		
		packet.writeUInt16(world.dialogs.length);
		for (i = 0; i < world.dialogs.length; i++) {
			var dialog = world.dialogs[i];
			packet.writeUInt16(dialog.x);
			packet.writeUInt16(dialog.y);
			packet.writeString(dialog.text);
		}
		client.sendPacket(packet);
	}
	
	packet = new PacketWriter(0x000A);
	packet.writeUInt8(0xFF);
	
	client.sendPacket(packet);
	
};

PacketHandler.setHandler(0x0004, showWorldsPacketHandler);
PacketHandler.setHandler(0x000B, showWorldsPacketHandler);

PacketHandler.setHandler(0x0006, function (client, reader) {
	// Request world state
	
	if (!client.account) {
		client.disconnect('Trying to select world while not loggedin');
		return;
	}
	
	var packet = new PacketWriter(0x0003);
	packet.writeUInt8(0);
	packet.writeUInt8(0);
	
	client.sendPacket(packet);
});

PacketHandler.setHandler(0x0005, function (client, reader) {
	// Select channel
	
	if (!client.account) {
		client.disconnect('Trying to select channel while not loggedin');
		return;
	}
	
	if (reader.readUInt8() !== 2) return;
	var worldId = reader.readUInt8();
	var channelId = reader.readUInt8();
	
	var world = getWorldInfoById(worldId);
	
	var packet = new PacketWriter(0x000B);
	if (world === null || channelId < 0 || channelId > world.channels) {
		packet.writeUInt8(8);
	}
	else {
		client.state = {
			worldId: worldId,
			channelId: channelId
		};
	
		packet.writeUInt8(0);
		
		var characters = client.account.getCharacters(client.state.worldId);
		packet.writeUInt8(characters.length);

		for (var i = 0; i < characters.length; i++) {
			var character = characters[i];

			character.addStats(packet);
			character.addAvatar(packet);
			
			packet.writeUInt8(0); // ?
			
			packet.writeUInt8(false); // No rankings
			// packet.writeUInt32(character.rankWorld);
			// packet.writeUInt32(character.rankWorldChange);
			// packet.writeUInt32(character.rankJob);
			// packet.writeUInt32(character.rankJobChange);
			/*
			packet.writeUInt32(1);
			packet.writeUInt32(1);
			packet.writeUInt32(1);
			packet.writeUInt32(1);
			*/
		}
		
		
		packet.writeUInt8(1); // PIC registered
		packet.writeUInt32(6); // Max Characters
	}
	
	
	client.sendPacket(packet);
});