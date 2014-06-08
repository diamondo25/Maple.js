PacketHandler.setHandler(0x0014, function (client, reader) {
	if (client.character) {
		client.disconnect('Trying to load while already loaded.');
		return;
	}
	
	var characterId = reader.readUInt32();
	
	var character = findDocumentByCutoffId(Character, characterId, {
		worldId: client.server.worldId
	});
	
	if (!character) {
		client.disconnect('Character not found!');
		return;
	}
	
	client.character = character;
	client.account = wait.forMethod(Account, 'findOne', { _id: character.account });
	
	if (!client.account) {
		client.disconnect('Account not found!');
		return;
	}
	
	character.mapId = 100000000;
	
	// Kick back user if needed
	var map = getMap(character.mapId);
	if (map.forcedReturn != 999999999) {
		character.mapId = map.forcedReturn;
		map = getMap(character.mapId);
	}
	character.mapPos = character.mapPos || 0;
	
	client.location = new MovableLife();
	
	var spawnpoint = map.getPortalById(character.mapPos);

	if (spawnpoint) {
		client.location.x = spawnpoint.x;
		client.location.y = spawnpoint.y;
	}
	
	client.portalCount = 1;
	client.lastTickCount = -1;
	
	
	// Send data to player
	
	var packet = new PacketWriter(0x007D);
	packet.writeUInt32(client.server.channelId);
	packet.writeUInt8(client.portalCount); // Portal count
	packet.writeUInt8(true);
	packet.writeUInt16(0);
	
	// RNGs
	packet.writeUInt32(123123312);
	packet.writeUInt32(234232);
	packet.writeUInt32(123123132);
	
	packet.writeBytes([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
	packet.writeUInt8(0);
	
	character.addStats(packet);
	
	packet.writeUInt8(20); // Buddylist size
	packet.writeUInt8(false); // Blessing of the Fairy name

	var j, i, item;
	{
		// Inventory
		packet.writeUInt32(character.inventory.mesos);
		for (i = 0; i < 5; i++)
			packet.writeUInt8(character.inventory.maxSlots[i]);
	
		packet.writeUInt64(new Int64('0x14F373BFDE04000'));
		
		var equips = character.getInventory(1);
		

		// Regular
		for (j = 0; j < equips.length; j++) {
			item = equips[j];
			if (!(item.slot > -100 && item.slot <= 0)) continue;
			
			packet.writeUInt16(Math.abs(item.slot));
			writeItemPacketData(item, packet);
		}
		packet.writeUInt16(0);
		
		// Cash
		for (j = 0; j < equips.length; j++) {
			item = equips[j];
			if (!(item.slot > -200 && item.slot <= -100)) continue;
			
			packet.writeUInt16(Math.abs(item.slot));
			writeItemPacketData(item, packet);
		}
		packet.writeUInt16(0);
		
		// Equip Inventory
		for (j = 0; j < equips.length; j++) {
			item = equips[j];
			if (item.slot <= 0) continue;
			
			packet.writeUInt16(Math.abs(item.slot));
			writeItemPacketData(item, packet);
		}
		packet.writeUInt16(0);
		
		// Evan
		for (j = 0; j < equips.length; j++) {
			item = equips[j];
			if (!(item.slot >= 1000 && item.slot < 1004)) continue;
			
			packet.writeUInt16(Math.abs(item.slot));
			writeItemPacketData(item, packet);
		}
		packet.writeUInt16(0);
		
		for (i = 2; i <= 5; i++) {
			// For each inventory...
			var inventory = character.getInventory(i);
			for (j = 0; j < inventory.length; j++) {
				item = inventory[j];
				packet.writeUInt8(item.slot);
				writeItemPacketData(item, packet);
			}
			packet.writeUInt8(0);
		}
	}
	
	{
		// Skills
		var skills = findRows(Skill, 'characterId', character);
		packet.writeUInt16(skills.length); // Unlocked
		for (i = 0; i < skills.length; i++) {
			var skill = skills[i];
			packet.writeUInt32(skill.skillId);
			packet.writeUInt32(skill.points);
			
			if (skill.expires === null)
				packet.writeUInt64(Constants.Item.NoExpiration);
			else
				packet.writeDate(skill.expires);

			if ((Math.floor(skill.skillId / 10000) % 10) == 2)
				packet.writeUInt32(skill.maxLevel);
		}

		packet.writeUInt16(0); // Cooldowns
	}
	
	{
		// Quests
		packet.writeUInt16(0); // Running
		packet.writeUInt16(0); // Finished
	}
	
	packet.writeUInt16(0); // Crush Rings
	packet.writeUInt16(0); // Friend Rings
	packet.writeUInt16(0); // Marriage Rings
	packet.writeUInt16(0);
	
	{
		// Teleport Rocks
		for (i = 0; i < 5; i++)
			packet.writeUInt32(999999999);
		
		for (i = 0; i < 10; i++)
			packet.writeUInt32(999999999);
	}
	
	{
		// Monsterbook
		packet.writeUInt32(0); // Cover
		packet.writeUInt8(0); // 'readmode'
		packet.writeUInt16(0); // cards
	}
	
	packet.writeUInt16(0);
	packet.writeUInt16(0);
	packet.writeUInt16(0);
	
	packet.writeDate(new Date()); // Current time
	
	client.sendPacket(packet);
	
	
	map.addClient(client);
});