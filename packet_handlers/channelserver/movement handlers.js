PacketHandler.setHandler(0x0029, function (client, reader) {
	// Player movement
	if (!client.character) {
		client.disconnect('Trying to move while not loaded');
		return;
	}
	
	var portals = reader.readUInt8();
	if (portals !== client.portalCount) {
		console.warn('Moving on a different map (portalCount did not match: ' + portals + ' != ' + client.portalCount + ')');
		return;
	}
	
	
	reader.skip(4); // Seems to be some unique value per-map

	var movePath = client.location.decodeMovePath(reader, false);
	if (movePath.length === 0) {
		// Sending this to a client actually crashes it!
		client.disconnect('Empty move path');
		return;
	}

	var packet = new PacketWriter(0x00B9);
	packet.writeUInt32(getDocumentId(client.character));
	MovableLife.encodeMovePath(movePath, packet);
	
	getMap(client.character.mapId).broadcastPacket(packet, client);
});