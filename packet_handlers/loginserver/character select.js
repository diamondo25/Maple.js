var wait = require('wait.for');

PacketHandler.SetHandler(0x0015, function (pSocket, pReader) {
	// Check character name
	
	if (!pSocket.account || !pSocket.state) {
		pSocket.Disconnect();
		return;
	}
	
	var name = pReader.ReadString();
	
	var found = true;
	if (name.length >= 4 && name.length <= 12) {
		found = wait.forMethod(Character, 'count', { name: name }) == 0;
	}
	
	var packet = new PacketWriter(0x000D);
	packet.WriteString(name);
	packet.WriteUInt8(found); // Taken bool
	
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
			mesos: 100000000,
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