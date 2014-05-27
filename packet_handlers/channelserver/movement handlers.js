PacketHandler.SetHandler(0x0029, function (pClient, pReader) {
	// Player movement
	if (!pClient.character) {
		pClient.Disconnect('Trying to move while not loaded');
		return;
	}
	
	var portalCount = pReader.ReadUInt8();
	pReader.Skip(4); // Seems to be some unique value per-map

	var movePath = pClient.location.DecodeMovePath(pReader, false);
	if (movePath.length == 0) {
		// Sending this to a client actually crashes it!
		pClient.Disconnect('Empty move path');
		return;
	}

	var packet = new PacketWriter(0x00B9);
	packet.WriteUInt32(GetDocumentId(pClient.character));
	packet.WriteUInt32(0);
	MovableLife.EncodeMovePath(movePath, packet);
	
	GetMap(pClient.character.mapId).BroadcastPacket(packet, pClient);
	
});