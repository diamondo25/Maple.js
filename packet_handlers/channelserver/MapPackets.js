global.MapPackets = {
	GetEnterMapPacket: function (pClient) {
		var character = pClient.character;
		
		var packet = new PacketWriter(0x00A0);
		packet.WriteUInt32(GetDocumentId(character));
		packet.WriteUInt8(character.stats.level);
		packet.WriteString(character.name);
		
		// Guild info
		packet.WriteString('');
		packet.WriteUInt16(0);
		packet.WriteUInt8(0);
		packet.WriteUInt16(0);
		packet.WriteUInt8(0);
		
		{
			var bits = new BitSet32(128);
		
			packet.WriteBytes(bits.ToBuffer());
			
			packet.WriteUInt8(0); // Unknown
			packet.WriteUInt8(0);
		}
		
		packet.WriteUInt16(character.stats.job);
		
		character.AddAvatar(packet);
		
		
		packet.WriteUInt32(0); // Choco count: the amount of valentine boxes in its inventory (5110000)
		packet.WriteUInt32(0); // Active item ID
		packet.WriteUInt32(0); // Active chair ID
		
		packet.WriteUInt16(pClient.location.x); // X
		packet.WriteUInt16(pClient.location.y); // Y
		
		packet.WriteUInt8(pClient.location.stance); // Stance
		packet.WriteUInt16(pClient.location.foothold); // Foothold
		
		packet.WriteUInt8(0); // Probably admin flag! : GradeCode & 1. Doesn't seem to do anything, tho
		
		{
			for (var i = 0; i < 3; i++) {
				if (false) {
					packet.WriteUInt8(1);
					packet.WriteUInt32(0); // Pet Item ID
					packet.WriteString(''); // Pet name
					packet.WriteUInt64(0); // Pet Cash ID
					packet.WriteUInt16(0); // X
					packet.WriteUInt16(0); // Y
					packet.WriteUInt16(0); // Stance
					packet.WriteUInt16(0); // Foothold
					packet.WriteUInt8(0); // Name tag
					packet.WriteUInt8(0); // Quote item
				}
			}
			// Pets block
			packet.WriteUInt8(0);
		}
		
		
		packet.WriteUInt32(0); // Taming mob level
		packet.WriteUInt32(0); // Taming mob EXP
		packet.WriteUInt32(0); // Taming mob Fatigue
		
		packet.WriteUInt8(0);
		if (false) {
			// Miniroom
			packet.WriteUInt32(0);
			packet.WriteString('');
			packet.WriteUInt8(0);
			packet.WriteUInt8(0);
			packet.WriteUInt8(0);
			packet.WriteUInt8(0);
			packet.WriteUInt8(0);
		}
		
		packet.WriteUInt8(0);
		if (false) {
			// Chalkboard
			packet.WriteString('');
		}
		
		packet.WriteUInt8(0);
		if (false) {
			// Couple ring
			packet.WriteUInt64(0);
			packet.WriteUInt64(0);
			packet.WriteUInt32(0);
		}
		
		packet.WriteUInt8(0);
		if (false) {
			// Friend ring
			packet.WriteUInt64(0);
			packet.WriteUInt64(0);
			packet.WriteUInt32(0);
		}
		
		packet.WriteUInt8(0);
		if (false) {
			// Marriage ring
			packet.WriteUInt32(0);
			packet.WriteUInt32(0);
			packet.WriteUInt32(0);
		}
		
		
		packet.WriteUInt8(0);
		if (false) {
			var amount = 0;
			packet.WriteUInt32(amount);
			for (var i = 0; i < amount; i++) {
				packet.WriteUInt32(0); // OnNewYearRecordAdd ?
			}
		}
		
		packet.WriteUInt8(0); // Beserk?
		packet.WriteUInt8(0); // Unknown
		
		return packet;
	},
	
	GetLeaveMapPacket: function (pClient) {
		var character = pClient.character;
		var packet = new PacketWriter(0x00A1);
		packet.WriteUInt32(GetDocumentId(character));
		
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
	GetPortalErrorPacket: function (pError) {
		var packet = new PacketWriter(0x0083);
		packet.WriteUInt8(pError);
		return packet;
	},
	
	
	
	ChangeMap: function (pClient, pMap, pSpawnPoint) {
		// Helper function for changing map.
		var character = pClient.character;
		
		// Remove player from old map
		GetMap(character.mapId).RemoveClient(pClient);
		
		pClient.portalCount++;
		character.mapId = pMap;
		character.mapPos = pSpawnPoint;
		character.save();
		
		var packet = new PacketWriter(0x007D);
		packet.WriteUInt32(pClient.server.channelId);
		packet.WriteUInt8(pClient.portalCount); // Portal count
		packet.WriteUInt8(false);
		packet.WriteUInt16(0);
		
		packet.WriteUInt8(0);
		packet.WriteUInt32(character.mapId);
		packet.WriteUInt8(character.mapPos);
		packet.WriteUInt16(character.stats.hp);
		packet.WriteUInt8(0);
		
		packet.WriteDate(new Date());
		
		pClient.SendPacket(packet);
		
		
		GetMap(character.mapId).AddClient(pClient);
		
	}
};