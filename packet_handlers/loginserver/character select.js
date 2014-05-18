
PacketHandler.SetHandler(0x0015, function (pSocket, pReader) {
	// Check character name
	
	if (!pSocket.account || !pSocket.state) {
		pSocket.Disconnect();
		return;
	}
	
	var name = pReader.ReadString();
	
	var packet = new PacketWriter(0x000D);
	packet.WriteString(name);
	packet.WriteUInt8(false); // Taken bool
	
	pSocket.SendPacket(packet);
});


PacketHandler.SetHandler(0x0013, function (pSocket, pReader) {
	// Select character
	
	if (!pSocket.account || !pSocket.state) {
		pSocket.Disconnect();
		return;
	}
	
	var characterId = pReader.ReadUInt32();
	var macAddr = pReader.ReadString();
	var macAddrNoDashes = pReader.ReadString();
	
	var world = GetWorldInfoById(pSocket.state.worldId);
	
	var packet = new PacketWriter(0x000C);
	packet.WriteUInt16(0);
	packet.WriteBytes(IPStringToBytes(world.publicIP));
	packet.WriteUInt16(world.portStart + pSocket.state.channelId);
	packet.WriteUInt32(characterId);
	packet.WriteUInt8(2);
	packet.WriteUInt32(0);
	
	pSocket.SendPacket(packet);
});