module.exports = {
	getYellowMessage: function (pText) {
		var packet = new PacketWriter(0x004D);
		packet.writeUInt8(true);
		packet.writeString(pText);
		return packet;
	},
	
	ServerChangeBlockedReasons: {
		CANNOT_GO: 1,
		NO_CASHSHOP_AVAILABLE: 2,
		MTS_UNAVAILABLE: 3,
		MTS_USER_LIMIT_REACHED: 4,
		LEVEL_TOO_LOW: 5
	},
	
	getServerChangeBlockedMessage: function (pReason) {
		var packet = new PacketWriter(0x0084);
		packet.writeUInt8(pReason);
		return packet;
	}
};