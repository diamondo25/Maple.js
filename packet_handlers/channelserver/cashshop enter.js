PacketHandler.setHandler(0x0028, function (client, reader) {
	// Enter cashshop
	client.sendPacket(packets.player.getServerChangeBlockedMessage(packets.player.ServerChangeBlockedReasons.NO_CASHSHOP_AVAILABLE));
});