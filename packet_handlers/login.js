PacketHandler.SetHandler(0x0001, function (pSocket, pReader) {
	console.log('LoginPacket');
	var username = pReader.ReadString();
	var password = pReader.ReadString();

	
	var account = new Account();
	
	var packet = new global.PacketWriter(0x0000);
	
	if (account.banResetDate !== null) {
		packet.WriteUInt16(2);
		packet.WriteUInt32(0);
		packet.WriteUInt8(account.banReason);
		packet.WriteDate(account.banResetDate);
	}
	else {
		packet.WriteUInt16(0);
		packet.WriteUInt32(0);
		
		packet.WriteUInt32(account.id); // userid
		packet.WriteUInt8(0);
		packet.WriteUInt8(0x40);
		packet.WriteUInt8(0);
		packet.WriteUInt8(0);
		packet.WriteString(account.name);
		packet.WriteUInt8(0);
		packet.WriteUInt8(account.muteReason);
		packet.WriteDate(account.muteResetDate);
		
		packet.WriteDate(account.creationDate);
		
		packet.WriteUInt32(0);
		
		// PIC info
		packet.WriteUInt8(true);
		packet.WriteUInt8(2);
	}
	pSocket.SendPacket(packet);
	
});

var showWorldsPacketHandler = function (pSocket, pReader) {
	// Request worlds
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
			packet.WriteUInt32(0);
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
		pSocket.SendPacket(packet);
	}
	
	packet = new PacketWriter(0x000A);
	packet.WriteUInt8(0xFF);
	
	pSocket.SendPacket(packet);
	
};

PacketHandler.SetHandler(0x0004, showWorldsPacketHandler);
PacketHandler.SetHandler(0x000B, showWorldsPacketHandler);

PacketHandler.SetHandler(0x0006, function (pSocket, pReader) {
	// Request world state
	var packet = new PacketWriter(0x0003);
	packet.WriteUInt8(0);
	packet.WriteUInt8(0);
	
	pSocket.SendPacket(packet);
});

PacketHandler.SetHandler(0x0005, function (pSocket, pReader) {
	// Select channel
	if (pReader.ReadUInt8() !== 2) return;
	var worldId = pReader.ReadUInt8();
	var channelId = pReader.ReadUInt8();
	
	var world = GetWorldInfoById(worldId);
	
	var packet = new PacketWriter(0x000B);
	if (world === null || channelId < 0 || channelId > world.channels) {
		console.log(world);
		console.log(world.channels);
		console.log(channelId);
		packet.WriteUInt8(8);
	}
	else {
		packet.WriteUInt8(0);
		
		var characters = 1;
		packet.WriteUInt8(characters);
		
		for (var i = 0; i < characters; i++) {
			var character = new Character();
			character.name = 'HERPFAIC: ' + i;
			character.stats.level = 123;
			character.RandomizeLook();
			
			
			character.AddStats(packet);
			character.AddAvatar(packet);
			
			packet.WriteUInt8(0); // ?
			
			packet.WriteUInt8(0); // No rankings
			// packet.WriteUInt32(character.rankWorld);
			// packet.WriteUInt32(character.rankWorldChange);
			// packet.WriteUInt32(character.rankJob);
			// packet.WriteUInt32(character.rankJobChange);
			packet.WriteUInt32(1);
			packet.WriteUInt32(1);
			packet.WriteUInt32(1);
			packet.WriteUInt32(1);
		}
		
		
		packet.WriteUInt8(2); // No PIC
		packet.WriteUInt32(6); // Max Characters
	}
	
	
	pSocket.SendPacket(packet);
});

PacketHandler.SetHandler(0x0015, function (pSocket, pReader) {
	// Check character name
	var name = pReader.ReadString();
	
	var packet = new PacketWriter(0x000D);
	packet.WriteString(name);
	packet.WriteUInt8(false); // Taken bool
	
	pSocket.SendPacket(packet);
});