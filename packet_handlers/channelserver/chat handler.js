
PacketHandler.SetHandler(0x0031, function (pClient, pReader) {
	// Player chat
	if (!pClient.character) {
		pClient.Disconnect('Trying to chat while not loaded.');
		return;
	}
	
	var text = pReader.ReadString();
	var shouting = pReader.ReadUInt8() != 0;
	
	
	var packet = new PacketWriter(0x00A2);
	packet.WriteUInt32(GetDocumentId(pClient.character));
	packet.WriteUInt8(pClient.account.isAdmin);
	packet.WriteString(text);
	packet.WriteUInt8(shouting);
	
	GetMap(pClient.character.mapId).BroadcastPacket(packet);
	
	var elements = text.split(' ');
	console.log(elements);
	switch (elements[0]) {
		case '!packet':
			var packet = new PacketWriter();
			packet.WriteHexString(elements.slice(1).join());
			pClient.SendPacket(packet);
			break;
	}
});