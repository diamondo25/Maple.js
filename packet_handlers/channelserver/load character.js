PacketHandler.SetHandler(0x0014, function (pClient, pReader) {
	if (pClient.character) {
		pClient.Disconnect('Trying to load while already loaded.');
		return;
	}
	
	var characterId = pReader.ReadUInt32();
	
	var character = FindDocumentByCutoffId(Character, characterId, {
		worldId: pClient.server.worldId
	})
	
	if (!character) {
		pClient.Disconnect('Character not found!');
		return;
	}
	
	pClient.character = character;
	pClient.account = wait.forMethod(Account, 'findOne', { _id: character.account });
	
	if (!pClient.account) {
		pClient.Disconnect('Account not found!');
		return;
	}
	
	character.mapId = 100000000;
	
	// Kick back user if needed
	var map = GetMap(character.mapId);
	if (map.forcedReturn != 999999999) {
		character.mapId = map.forcedReturn;
		map = GetMap(character.mapId);
	}
	character.mapPos = character.mapPos || 0;
	
	pClient.location = new MovableLife();
	
	var spawnpoint = map.GetPortalById(character.mapPos);
	console.log(spawnpoint);
	if (spawnpoint) {
		pClient.location.x = spawnpoint.x;
		pClient.location.y = spawnpoint.y;
	}
	
	pClient.portalCount = 1;
	
	var packet = new PacketWriter(0x007D);
	packet.WriteUInt32(pClient.server.channelId);
	packet.WriteUInt8(pClient.portalCount); // Portal count
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
		packet.WriteUInt32(character.inventory.mesos);
		for (var i = 0; i < 5; i++)
			packet.WriteUInt8(character.inventory.maxSlots[i]);
	
		packet.WriteUInt64(new Int64('0x14F373BFDE04000'));
		
		var equips = character.GetInventory(1);
		
		// Regular
		for (var j = 0; j < equips.length; j++) {
			var item = equips[j];
			if (!(item.slot > -100 && item.slot <= 0)) continue;
			packet.WriteUInt16(Math.abs(item.slot));
			WriteItemPacketData(item, packet);
		}
		packet.WriteUInt16(0);
		
		// Cash
		for (var j = 0; j < equips.length; j++) {
			var item = equips[j];
			if (!(item.slot > -200 && item.slot <= -100)) continue;
			packet.WriteUInt16(Math.abs(item.slot));
			WriteItemPacketData(item, packet);
		}
		packet.WriteUInt16(0);
		
		// Equip Inventory
		for (var j = 0; j < equips.length; j++) {
			var item = equips[j];
			if (!(item.slot > 0)) continue;
			packet.WriteUInt16(Math.abs(item.slot));
			WriteItemPacketData(item, packet);
		}
		packet.WriteUInt16(0);
		
		// Evan
		for (var j = 0; j < equips.length; j++) {
			var item = equips[j];
			if (!(item.slot >= 1000 && item.slot < 1004)) continue;
			packet.WriteUInt16(Math.abs(item.slot));
			WriteItemPacketData(item, packet);
		}
		packet.WriteUInt16(0);
		
		for (var i = 2; i <= 5; i++) {
			// For each inventory...
			var inventory = character.GetInventory(i);
			for (var j = 0; j < inventory.length; j++) {
				var item = inventory[j];
				packet.WriteUInt8(item.slot);
				WriteItemPacketData(item, packet);
			}
			packet.WriteUInt8(0);
		}
	}
	
	{
		// Skills
		var skills = FindRows(Skill, 'characterId', character);
		packet.WriteUInt16(skills.length); // Unlocked
		for (var i = 0; i < skills.length; i++) {
			var skill = skills[i];
			packet.WriteUInt32(skill.skillId);
			packet.WriteUInt32(skill.points);
			
			if (skill.expires === null)
				packet.WriteUInt64(Constants.Item.NoExpiration);
			else
				packet.WriteDate(skill.expires);

			if ((Math.floor(skill.skillId / 10000) % 10) == 2)
				packet.WriteUInt32(skill.maxLevel);
		}

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
	
	pClient.SendPacket(packet);
	
	
	map.AddClient(pClient);
});