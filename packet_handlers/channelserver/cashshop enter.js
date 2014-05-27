PacketHandler.SetHandler(0x0028, function (pClient, pReader) {
	// Enter cashshop
	pClient.SendPacket(MapPackets.GetPortalErrorPacket(MapPackets.PortalBlockedErrors.CASHSHOP_IS_UNAVAILABLE));
});