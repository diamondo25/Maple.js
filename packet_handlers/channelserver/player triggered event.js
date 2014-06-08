PacketHandler.setHandler(0x0059, function (client, reader) {
	// Healing and status changes...
	if (!client.character) {
		client.disconnect('Got status change packet while no character is loaded');
		return;
	}
	
	if (isInvalidTickCount(client, 'healing', reader.readUInt32())) return;
	
	if (client.character.stats.hp === 0) {
		// Hacking

		client.disconnect('Got status change packet while character is DEAD.');
		return;
	}
	
	var map = getMap(client.character.mapId);
	
	var flags = reader.readUInt32();
	
	var hp = 0, mp = 0, recoveryRate = map.recoveryRate;
	
	if (flags & 0x0400) hp = reader.readUInt16();
	if (flags & 0x1000) mp = reader.readUInt16();
	
	var extraFlags = reader.readUInt8();
	if (extraFlags & 0x02) {
		// Sitting on a chair!
		recoveryRate *= 1.5;
	}
	
	var itemTop = client.character.getItem(1, Constants.EquipSlots.Top);
	if (itemTop !== null) {
		
	}
});