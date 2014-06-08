module.exports = {
	getEnterMapPacket: function (client) {
		var character = client.character;
		var i;
		
		var packet = new PacketWriter(0x00A0);
		packet.writeUInt32(getDocumentId(character));
		packet.writeUInt8(character.stats.level);
		packet.writeString(character.name);
		
		// Guild info
		packet.writeString('');
		packet.writeUInt16(0);
		packet.writeUInt8(0);
		packet.writeUInt16(0);
		packet.writeUInt8(0);
		
		{
			var bits = new BitSet32(128);
		
			packet.writeBytes(bits.toBuffer());
			
			packet.writeUInt8(0); // Unknown
			packet.writeUInt8(0);
		}
		
		packet.writeUInt16(character.stats.job);
		
		character.addAvatar(packet);
		
		
		packet.writeUInt32(0); // Choco count: the amount of valentine boxes in its inventory (5110000)
		packet.writeUInt32(0); // Active item ID
		packet.writeUInt32(0); // Active chair ID
		
		packet.writeUInt16(client.location.x); // X
		packet.writeUInt16(client.location.y); // Y
		
		packet.writeUInt8(client.location.stance); // Stance
		packet.writeUInt16(client.location.foothold); // Foothold
		
		packet.writeUInt8(0); // Probably admin flag! : GradeCode & 1. Doesn't seem to do anything, tho
		
		{
			for (i = 0; i < 3; i++) {
				if (false) {
					packet.writeUInt8(1);
					packet.writeUInt32(0); // Pet Item ID
					packet.writeString(''); // Pet name
					packet.writeUInt64(0); // Pet Cash ID
					packet.writeUInt16(0); // X
					packet.writeUInt16(0); // Y
					packet.writeUInt16(0); // Stance
					packet.writeUInt16(0); // Foothold
					packet.writeUInt8(0); // Name tag
					packet.writeUInt8(0); // Quote item
				}
			}
			// Pets block
			packet.writeUInt8(0);
		}
		
		
		packet.writeUInt32(0); // Taming mob level
		packet.writeUInt32(0); // Taming mob EXP
		packet.writeUInt32(0); // Taming mob Fatigue
		
		packet.writeUInt8(0);
		if (false) {
			// Miniroom
			packet.writeUInt32(0);
			packet.writeString('');
			packet.writeUInt8(0);
			packet.writeUInt8(0);
			packet.writeUInt8(0);
			packet.writeUInt8(0);
			packet.writeUInt8(0);
		}
		
		packet.writeUInt8(0);
		if (false) {
			// Chalkboard
			packet.writeString('');
		}
		
		packet.writeUInt8(0);
		if (false) {
			// Couple ring
			packet.writeUInt64(0);
			packet.writeUInt64(0);
			packet.writeUInt32(0);
		}
		
		packet.writeUInt8(0);
		if (false) {
			// Friend ring
			packet.writeUInt64(0);
			packet.writeUInt64(0);
			packet.writeUInt32(0);
		}
		
		packet.writeUInt8(0);
		if (false) {
			// Marriage ring
			packet.writeUInt32(0);
			packet.writeUInt32(0);
			packet.writeUInt32(0);
		}
		
		
		packet.writeUInt8(0);
		if (false) {
			var amount = 0;
			packet.writeUInt32(amount);
			for (i = 0; i < amount; i++) {
				packet.writeUInt32(0); // OnNewYearRecordAdd ?
			}
		}
		
		packet.writeUInt8(0); // Beserk?
		packet.writeUInt8(0); // Unknown
		
		return packet;
	},
	
	getLeaveMapPacket: function (client) {
		var packet = new PacketWriter(0x00A1);
		packet.writeUInt32(getDocumentId(client.character));
		
		return packet;
	},
	
	PortalBlockedErrors: {
		CLOSED_FOR_NOW: 1,
		CANNOT_GO_TO_THAT_PLACE: 2,
		UNABLE_TO_APPROACH_DUE_TO_THE_FORCE_OF_THE_GROUND: 3,
		CANNOT_TELEPORT_TO_OR_ON_THIS_MAP: 4,
		// 5 same as 3
		CAN_ONLY_BE_ENTERED_BY_PARTY_MEMBERS: 6,
		CASHSHOP_IS_UNAVAILABLE: 7,
	},

	getPortalErrorPacket: function (error) {
		var packet = new PacketWriter(0x0083);
		packet.writeUInt8(error);
		return packet;
	},
	
	
	
	changeMap: function (client, map, spawnPoint) {
		var newMap = getMap(map);
		if (newMap === null) return false;
		
		// Helper function for changing map.
		var character = client.character;
		
		// Remove player from old map
		getMap(character.mapId).removeClient(client);
		
		client.portalCount++;
		character.mapId = map;
		character.mapPos = spawnPoint;
		character.save();
		
		var packet = new PacketWriter(0x007D);
		packet.writeUInt32(client.server.channelId);
		packet.writeUInt8(client.portalCount); // Portal count
		packet.writeUInt8(false);
		packet.writeUInt16(0);
		
		packet.writeUInt8(0);
		packet.writeUInt32(character.mapId);
		packet.writeUInt8(character.mapPos);
		packet.writeUInt16(character.stats.hp);
		packet.writeUInt8(0);
		
		packet.writeDate(new Date());
		
		client.sendPacket(packet);
		
		
		newMap.addClient(client);
		return true;
	}
};