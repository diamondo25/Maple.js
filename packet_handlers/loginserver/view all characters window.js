function SendCharacters(pClient, pWorldId, pCharacters) {
	var packet = new PacketWriter(0x0008);
	packet.WriteUInt8(0);

	packet.WriteUInt8(pWorldId);	
	packet.WriteUInt8(pCharacters.length);
	
	for (var i = 0; i < pCharacters.length; i++) {
		var character = pCharacters[i];
		
		character.AddStats(packet);
		character.AddAvatar(packet);
		
		packet.WriteUInt8(false);
	}
	
	
	pClient.SendPacket(packet);
}

PacketHandler.SetHandler(0x000D, function (pClient, pReader) {
	// View all characters (clicked VAC button)

	if (!pClient.account) {
		pClient.Disconnect('Trying to view all characters while not loggedin');
		return;
	}

	var worldInConfig = ServerConfig.worlds;
	var worlds = {};
	for (var worldName in worldInConfig) {
		var worldId = worldInConfig[worldName].id;
		worlds[worldId] = pClient.account.GetCharacters(worldId);
	}

	
	
	var packet = new PacketWriter(0x0008);
	packet.WriteUInt8(1);

	var totalCharacters = 0;
	for (var worldId in worlds) {
		totalCharacters += worlds[worldId].length;
	}
	packet.WriteUInt32(totalCharacters);
	packet.WriteUInt32(totalCharacters + (3 - totalCharacters % 3));
	
	pClient.SendPacket(packet);
	
	
	
	for (var worldId in worlds) {
		if (worlds[worldId].length == 0) continue;
		SendCharacters(pClient, worldId, worlds[worldId]);
	}
});


function EnterChannel(pClient, pCharacterId, pWorldId) {
	var world = GetWorldInfoById(pWorldId);
	var channel = (world.channels * Math.random()) >>> 0;
	
	// Remote-hack vulnerable
	var packet = new PacketWriter(0x000C);
	packet.WriteUInt16(0);
	packet.WriteBytes(IPStringToBytes(world.publicIP));
	packet.WriteUInt16(world.portStart + channel);
	packet.WriteUInt32(pCharacterId);
	packet.WriteUInt8(0); // Flag bit 1 set = korean popup?
	packet.WriteUInt32(0); // Minutes left on Internet Cafe?
	
	pClient.SendPacket(packet);
}

PacketHandler.SetHandler(0x0020, function (pClient, pReader) {
	// Select VAC character with PIC
	if (!pClient.account) {
		pClient.Disconnect('Trying to select character in VAC window (PIC) while not loggedin');
		return;
	}
	
	var pic = pReader.ReadString();
	var characterId = pReader.ReadUInt32();
	var worldId = pReader.ReadUInt32();
	var macAddr = pReader.ReadString();
	var macAddrNoDashes = pReader.ReadString();
	
	EnterChannel(pClient, characterId, worldId); // Todo: Add check if the character is in this world AND from the same account
});

PacketHandler.SetHandler(0x000E, function (pClient, pReader) {
	// Select VAC character without PIC
	if (!pClient.account) {
		pClient.Disconnect('Trying to select character in VAC window while not loggedin');
		return;
	}
	
	var characterId = pReader.ReadUInt32();
	var worldId = pReader.ReadUInt32();
	var macAddr = pReader.ReadString();
	var macAddrNoDashes = pReader.ReadString();
	
	EnterChannel(pClient, characterId, worldId); // Todo: Add check if the character is in this world AND from the same account
});