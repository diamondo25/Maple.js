var wait = require('wait.for');

function CheckNameValidity(pName, pAdmin) {
	if (!pAdmin) {
		// Check if is a forbidden name
		var forbidden = false;
		DataFiles.etc.Child('ForbiddenName.img').ForEach(function (pNode) {
			if (pName.indexOf(pNode.GetData()) !== -1) {
				forbidden = true;
				return false;
			}
		});
		if (forbidden) return false;
	}
	
	return wait.forMethod(Character, 'count', { name: pName }) == 0;
}

function CheckItemValidity(pJob, pFemale, pElement, pObjectId) {
	var infoName = '';
	switch (pJob) {
		case 0: infoName = 'Info/Char'; break; // Adventurer
		case 1000: infoName = 'PremiumChar'; break; // Cygnus
		case 2000: infoName = 'OrientChar'; break; // Aran
	}
	
	infoName += pFemale ? 'Female' : 'Male';
	
	infoName += '/' + pElement;

	var valid = false;
	
	DataFiles.etc.GetPath('MakeCharInfo.img/' + infoName).ForEach(function (pNode) {
		var objectId = pNode.GetData();
		if (pObjectId == objectId) {
			valid = true;
			return false;
		}
	});
	
	return valid;
}

PacketHandler.SetHandler(0x0015, function (pSocket, pReader) {
	// Check character name
	
	if (!pSocket.account || !pSocket.state) {
		pSocket.Disconnect();
		return;
	}
	
	var name = pReader.ReadString();
	
	var taken = true;
	if (name.length >= 4 && name.length <= 12) {
		//found = wait.forMethod(Character, 'count', { name: name }) != 0;
		taken = !CheckNameValidity(name, pSocket.account.isAdmin);
	}
	
	var packet = new PacketWriter(0x000D);
	packet.WriteString(name);
	packet.WriteUInt8(taken); // Taken bool
	
	pSocket.SendPacket(packet);
});


PacketHandler.SetHandler(0x0017, function (pSocket, pReader) {
	// Check character name
	if (!pSocket.account || !pSocket.state) {
		pSocket.Disconnect();
		return;
	}
	
	var pic = pReader.ReadString();
	
	var id = pReader.ReadUInt32();
	var character = FindDocumentByCutoffId(Character, id, {
		account: pSocket.account._id,
		worldId: pSocket.state.worldId
	});
	
	if (!character) {
		pSocket.Disconnect();
		return;
	}
	
	wait.forMethod(character, 'remove');
	
	var packet = new PacketWriter(0x000F);
	packet.WriteUInt32(id);
	packet.WriteUInt8(0);
	
	pSocket.SendPacket(packet);
});

function EnterChannel(pSocket, pCharacterId) {
	var world = GetWorldInfoById(pSocket.state.worldId);
	
	// Remote-hack vulnerable
	var packet = new PacketWriter(0x000C);
	packet.WriteUInt16(0);
	packet.WriteBytes(IPStringToBytes(world.publicIP));
	packet.WriteUInt16(world.portStart + pSocket.state.channelId);
	packet.WriteUInt32(pCharacterId);
	packet.WriteUInt8(0); // Flag bit 1 set = korean popup?
	packet.WriteUInt32(0); // Minutes left on Internet Cafe?
	
	pSocket.SendPacket(packet);
}

PacketHandler.SetHandler(0x0013, function (pSocket, pReader) {
	// Select character
	
	if (!pSocket.account || !pSocket.state) {
		pSocket.Disconnect();
		return;
	}
	
	var characterId = pReader.ReadUInt32();
	var macAddr = pReader.ReadString();
	var macAddrNoDashes = pReader.ReadString();
	EnterChannel(pSocket, characterId);
});


PacketHandler.SetHandler(0x001E, function (pSocket, pReader) {
	// Select character
	
	if (!pSocket.account || !pSocket.state) {
		pSocket.Disconnect();
		return;
	}
	var pic = pReader.ReadString();
	
	var characterId = pReader.ReadUInt32();
	var macAddr = pReader.ReadString();
	var macAddrNoDashes = pReader.ReadString();
	EnterChannel(pSocket, characterId);
});


PacketHandler.SetHandler(0x0016, function (pSocket, pReader) {
	// Create character
	
	if (!pSocket.account || !pSocket.state) {
		pSocket.Disconnect();
		return;
	}
	
	var name = pReader.ReadString();
	if (name.length < 4 || name.length > 12) throw 'Name not inside length boundaries. Name: ' + name;
	
	var type = pReader.ReadUInt32();
	var startJob = 0, startMap = 0;
	if (type == 0) {
		// Cygnus: Noblesse
		startJob = 1000;
		startMap = 130030000;
	}
	else if (type == 2) {
		// Aran: Legend
		startJob = 2000;
		startMap = 914000000;
	}
	
	var eyes = pReader.ReadUInt32();
	var hair = pReader.ReadUInt32();
	var hairColor = pReader.ReadUInt32();
	var skin = pReader.ReadUInt32();
	var top = pReader.ReadUInt32();
	var bottom = pReader.ReadUInt32();
	var shoes = pReader.ReadUInt32();
	var weapon = pReader.ReadUInt32();
	var female = pReader.ReadUInt8() == 1;
	
	// Check items
	if (!CheckItemValidity(startJob, female, 0, eyes)) throw '[Character Creation] Invalid eyes';
	if (!CheckItemValidity(startJob, female, 1, hair)) throw '[Character Creation] Invalid hair';
	if (!CheckItemValidity(startJob, female, 2, hairColor)) throw '[Character Creation] Invalid hairColor';
	if (!CheckItemValidity(startJob, female, 3, skin)) throw '[Character Creation] Invalid skin';
	if (!CheckItemValidity(startJob, female, 4, top)) throw '[Character Creation] Invalid top';
	if (!CheckItemValidity(startJob, female, 5, bottom)) throw '[Character Creation] Invalid bottom';
	if (!CheckItemValidity(startJob, female, 6, shoes)) throw '[Character Creation] Invalid shoes';
	if (!CheckItemValidity(startJob, female, 7, weapon)) throw '[Character Creation] Invalid weapon';
	
	
	var character = new Character({
		account: pSocket.account,
		worldId: pSocket.state.worldId,
		name: name,
		eyes: eyes,
		hair: hair + hairColor,
		skin: skin,
		female: female,
		
		mapId: startMap,
		
		stats: {
			level: 1,
			job: startJob,
			str: 12,
			dex: 5,
			luk: 4,
			int: 4,
			hp: 50,
			mhp: 50,
			mp: 100,
			mmp: 100,
		},
		
		inventory: {
			mesos: 0,
			maxSlots: [96, 96, 96, 96, 96]
		}
	});
	
	wait.forMethod(character, 'save');
	
	// Create items
	
	function CreateItem(pItemId, pSlot, pInventory) {
		var item;
		if (pInventory == 1) {
			item = new Equip();
		}
		else {
			item = new Rechargeable();
			item.amount = 1;
		}
		item.character = character;
		item.inventory = pInventory;
		item.slot = pSlot;
		item.itemId = pItemId;
		wait.forMethod(item, 'save');
	}
	
	if (top != 0) CreateItem(top, -5, 1);
	if (bottom != 0) CreateItem(bottom, -6, 1);
	if (shoes != 0) CreateItem(shoes, -7, 1);
	if (weapon != 0) CreateItem(weapon, -11, 1);
	CreateItem(4161001, 1, 2);
	
	
	
	var packet = new PacketWriter(0x000E);
	packet.WriteUInt8(0);

	character.AddStats(packet);
	character.AddAvatar(packet);
	packet.WriteUInt8(0); // ?
	packet.WriteUInt8(false); // No rankings
	
	pSocket.SendPacket(packet);
});