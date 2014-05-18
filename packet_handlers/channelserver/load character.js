PacketHandler.SetHandler(0x0014, function (pSocket, pReader) {
	var characterId = pReader.ReadUInt32();
	
	var character = new Character({
		id: characterId,
		name: 'YourNewChar'
	});
	
	character.RandomizeLook();
	
	var packet = new PacketWriter(0x007D);
	packet.WriteUInt32(pSocket.server.channelId);
	packet.WriteUInt8(1); // Portal count
	packet.WriteUInt8(true);
	packet.WriteUInt16(0);
	
	// RNGs
	packet.WriteUInt32(123123312);
	packet.WriteUInt32(234232);
	packet.WriteUInt32(123123132);
	
	packet.WriteBytes([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
	packet.WriteUInt8(0);
	
	character.AddStats(packet);
	
	packet.WriteUInt8(20); // Buddylist size
	packet.WriteUInt8(false); // Blessing of the Fairy name
	
	{
		// Inventory
		packet.WriteUInt32(character.mesos);
		for (var i = 0; i < 5; i++)
			packet.WriteUInt8(character.maxSlots[i]);
	
		packet.WriteUInt64(new Int64('0x14F373BFDE04000'));
		
		packet.WriteUInt16(0);
		packet.WriteUInt16(0);
		packet.WriteUInt16(0);
		packet.WriteUInt16(0);
		
		for (var i = 1; i < 5; i++) {
			// For each inventory...
			
			packet.WriteUInt8(0);
		}
	}
	
	{
		// Skills
		packet.WriteUInt16(0); // Unlocked
		packet.WriteUInt16(0); // Cooldowns
	}
	
	{
		// Quests
		packet.WriteUInt16(0); // Running
		packet.WriteUInt16(0); // Finished
	}
	
	packet.WriteUInt16(0); // Crush Rings
	packet.WriteUInt16(0); // Friend Rings
	packet.WriteUInt16(0); // Marriage Rings
	packet.WriteUInt16(0);
	
	{
		// Teleport Rocks
		for (var i = 0; i < 5; i++)
			packet.WriteUInt32(999999999);
		
		for (var i = 0; i < 10; i++)
			packet.WriteUInt32(999999999);
	}
	
	{
		// Monsterbook
		packet.WriteUInt32(0); // Cover
		packet.WriteUInt8(0); // 'readmode'
		packet.WriteUInt16(0); // cards
	}
	
	packet.WriteUInt16(0);
	packet.WriteUInt16(0);
	packet.WriteUInt16(0);
	
	packet.WriteDate(new Date()); // Current time
	
	pSocket.SendPacket(packet);
});