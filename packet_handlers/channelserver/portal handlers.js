PacketHandler.SetHandler(0x0064, function (pClient, pReader) {
	// Enter scripted portal
	if (!pClient.character) {
		pClient.Disconnect('Trying to enter portal while not loaded');
		return;
	}
	
	if (pReader.ReadUInt8() != pClient.portalCount) {
		console.log('Entering portal while not in the same map.');
		pClient.Disconnect();
		return;
	}
	
	var portalName = pReader.ReadString();
	var x = pReader.ReadUInt16();
	var y = pReader.ReadUInt16();
	
	console.log('Portal script...: ' + portalName);
});

PacketHandler.SetHandler(0x0026, function (pClient, pReader) {
	// Enter regular portal
	if (!pClient.character) {
		pClient.Disconnect('Trying to enter portal while not loaded');
		return;
	}
	
	if (pReader.ReadUInt8() != pClient.portalCount) {
		pClient.Disconnect('Entering portal on a different map (portalCount did not match)');
		return;
	}
	
	var opcode = pReader.ReadInt32();
	
	switch (opcode) {
		case 0:
			// Dead
			if (pClient.character.stats.hp != 0) {
				pClient.Disconnect('Possible deadhack');
				return;
			}
			break;

		case -1:
			// Entering portal
			var portalName = pReader.ReadString();
			var x = pReader.ReadUInt16();
			var y = pReader.ReadUInt16();
			
			var map = GetMap(pClient.character.mapId);
			var portal = map.GetPortalByName(portalName);
			if (portal === null) {
				pClient.SendPacket(MapPackets.GetPortalErrorPacket(MapPackets.PortalBlockedErrors.CANNOT_GO_TO_THAT_PLACE));
				return;
			}
			
			if (!IsInsideBox(pClient.location.x, pClient.location.y, portal.x, portal.y, 70)) {
				pClient.Disconnect('Outside portal trigger range.');
				return;
			}
			
			if (portal.script != '') {
				// Run portal script... lol
				console.log('Portal script...: ' + portal.script);
				pClient.SendPacket(MapPackets.GetPortalErrorPacket(MapPackets.PortalBlockedErrors.CANNOT_GO_TO_THAT_PLACE));
			}
			else {
				var newMap = GetMap(portal.toMap);
				if (newMap === null) {
					pClient.SendPacket(MapPackets.GetPortalErrorPacket(MapPackets.PortalBlockedErrors.CANNOT_GO_TO_THAT_PLACE));
				}
				else {
					var portalTo = newMap.GetPortalByName(portal.toName);
					console.log(portalTo);
					MapPackets.ChangeMap(pClient, portal.toMap, portalTo.id);
				}
			}
			
			break;
		default:
			// Admin /m command
			if (!pClient.account.isAdmin) {
				console.log('Using admin /m command while not admin... :|');
				pClient.Disconnect();
				return;
			}
			break;
	}
});