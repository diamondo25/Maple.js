var showWorldsPacketHandler = function (pClient, pReader) {
	// Request worlds
	
	if (!pClient.account) {
		pClient.Disconnect('Trying to view worlds while not loggedin');
		return;
	}
	
	var packet;
	
	for (var worldName in ServerConfig.worlds) {
		var world = ServerConfig.worlds[worldName];
		packet = new PacketWriter(0x000A);
		
		packet.WriteUInt8(world.id);
		packet.WriteString(worldName);
		packet.WriteUInt8(world.ribbon);
		packet.WriteString(world.eventMessage);
		packet.WriteUInt16(100); // EXP Rate
		packet.WriteUInt16(100); // DROP Rate
		packet.WriteUInt8(world.characterCreationDisabled);
		
		var channels = world.channels;
		packet.WriteUInt8(channels);
		for (var i = 1; i <= channels; i++) {
			packet.WriteString(worldName + '-' + i);
			packet.WriteUInt32(13132); // Online players
			packet.WriteUInt8(world.id);
			packet.WriteUInt8(i - 1);
			packet.WriteUInt8(0);
		}
		
		packet.WriteUInt16(world.dialogs.length);
		for (var i = 0; i < world.dialogs.length; i++) {
			var dialog = world.dialogs[i];
			packet.WriteUInt16(dialog.x);
			packet.WriteUInt16(dialog.y);
			packet.WriteString(dialog.text);
		}
		pClient.SendPacket(packet);
	}
	
	packet = new PacketWriter(0x000A);
	packet.WriteUInt8(0xFF);
	
	pClient.SendPacket(packet);
	
};

PacketHandler.SetHandler(0x0004, showWorldsPacketHandler);
PacketHandler.SetHandler(0x000B, showWorldsPacketHandler);

PacketHandler.SetHandler(0x0006, function (pClient, pReader) {
	// Request world state
	
	if (!pClient.account) {
		pClient.Disconnect('Trying to select world while not loggedin');
		return;
	}
	
	var packet = new PacketWriter(0x0003);
	packet.WriteUInt8(0);
	packet.WriteUInt8(0);
	
	pClient.SendPacket(packet);
});

PacketHandler.SetHandler(0x0005, function (pClient, pReader) {
	// Select channel
	
	if (!pClient.account) {
		pClient.Disconnect('Trying to select channel while not loggedin');
		return;
	}
	
	if (pReader.ReadUInt8() !== 2) return;
	var worldId = pReader.ReadUInt8();
	var channelId = pReader.ReadUInt8();
	
	var world = GetWorldInfoById(worldId);
	
	var packet = new PacketWriter(0x000B);
	if (world === null || channelId < 0 || channelId > world.channels) {
		packet.WriteUInt8(8);
	}
	else {
		pClient.state = {
			worldId: worldId,
			channelId: channelId
		};
	
		packet.WriteUInt8(0);
		
		var characters = pClient.account.GetCharacters(pClient.state.worldId);
		packet.WriteUInt8(characters.length);
		
		for (var i = 0; i < characters.length; i++) {
			var character = characters[i];
			
			character.AddStats(packet);
			character.AddAvatar(packet);
			
			packet.WriteUInt8(0); // ?
			
			packet.WriteUInt8(false); // No rankings
			// packet.WriteUInt32(character.rankWorld);
			// packet.WriteUInt32(character.rankWorldChange);
			// packet.WriteUInt32(character.rankJob);
			// packet.WriteUInt32(character.rankJobChange);
			/*
			packet.WriteUInt32(1);
			packet.WriteUInt32(1);
			packet.WriteUInt32(1);
			packet.WriteUInt32(1);
			*/
		}
		
		
		packet.WriteUInt8(1); // PIC registered
		packet.WriteUInt32(6); // Max Characters
	}
	
	
	pClient.SendPacket(packet);
});