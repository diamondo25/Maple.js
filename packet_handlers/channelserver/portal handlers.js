PacketHandler.setHandler(0x0064, function (client, reader) {
	// Enter scripted portal
	if (!client.character) {
		client.disconnect('Trying to enter portal while not loaded');
		return;
	}
	
	if (reader.readUInt8() != client.portalCount) {
		console.log('Entering portal while not in the same map.');
		client.disconnect();
		return;
	}
	
	var portalName = reader.readString();
	var x = reader.readUInt16();
	var y = reader.readUInt16();
	
	console.log('Portal script...: ' + portalName);
});

PacketHandler.setHandler(0x0026, function (client, reader) {
	// Enter regular portal
	if (!client.character) {
		client.disconnect('Trying to enter portal while not loaded');
		return;
	}
	
	var portals = reader.readUInt8();
	if (portals !== client.portalCount) {
		console.warn('Entering portal on a different map (portalCount did not match: ' + portals + ' != ' + client.portalCount + ')');
		return;
	}
	
	var mapPacket = packets.map;
	var map = getMap(client.character.mapId);
	
	var opcode = reader.readInt32();
	
	switch (opcode) {
		case 0:
			// Dead
			if (client.character.stats.hp !== 0) {
				client.disconnect('Possible deadhack');
				return;
			}
			

			var newMap = map.returnMap == 999999999 ? map : getMap(map.returnMap);
			if (newMap === null) {
				client.sendPacket(mapPacket.getPortalErrorPacket(mapPacket.PortalBlockedErrors.CANNOT_GO_TO_THAT_PLACE));
			}
			else {
				mapPacket.changeMap(client, newMap.id, 0);
			}
			
			break;

		case -1:
			// Entering portal
			var portalName = reader.readString();
			var x = reader.readUInt16();
			var y = reader.readUInt16();
			
			var portal = map.getPortalByName(portalName);
			if (portal === null) {
				client.sendPacket(mapPacket.getPortalErrorPacket(mapPacket.PortalBlockedErrors.CANNOT_GO_TO_THAT_PLACE));
				return;
			}
			
			if (!isInsideBox(client.location.x, client.location.y, portal.x, portal.y, 70)) {
				client.disconnect('Outside portal trigger range.');
				return;
			}
			
			if (portal.script !== '') {
				// Run portal script... lol
				console.log('Portal script...: ' + portal.script);
				client.sendPacket(mapPacket.getPortalErrorPacket(mapPacket.PortalBlockedErrors.CANNOT_GO_TO_THAT_PLACE));
			}
			else {
				var newMap = getMap(portal.toMap);
				if (newMap === null) {
					client.sendPacket(mapPacket.getPortalErrorPacket(mapPacket.PortalBlockedErrors.CANNOT_GO_TO_THAT_PLACE));
				}
				else {
					var portalTo = newMap.getPortalByName(portal.toName);
					mapPacket.changeMap(client, portal.toMap, portalTo.id);
				}
			}
			
			break;
		default:
			// Admin /m command
			if (!client.account.isAdmin) {
				console.log('Using admin /m command while not admin... :|');
				client.disconnect();
				return;
			}
			break;
	}
});