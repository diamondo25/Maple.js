PacketHandler.SetHandler(0x0064, function (pSocket, pReader) {
	// Enter scripted portal
	pReader.ReadUInt8(); // Entered portals
	
	var portalName = pReader.ReadString();
	var x = pReader.ReadUInt16();
	var y = pReader.ReadUInt16();
});