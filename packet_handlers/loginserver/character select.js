function CheckNameValidity(name, admin) {
	if (!admin) {
		// Check if is a forbidden name
		var forbidden = false;
		DataFiles.etc.child('ForbiddenName.img').forEach(function (node) {
			if (name.indexOf(node.getData()) !== -1) {
				forbidden = true;
				return false;
			}
		});
		if (forbidden) return false;
	}
	
	return wait.forMethod(Character, 'count', { name: name }) === 0;
}

function CheckItemValidity(job, female, element, objectId) {
	var infoName = '';
	switch (job) {
		case 0: infoName = 'Info/Char'; break; // Adventurer
		case 1000: infoName = 'PremiumChar'; break; // Cygnus
		case 2000: infoName = 'OrientChar'; break; // Aran
	}
	
	infoName += female ? 'Female' : 'Male';
	
	infoName += '/' + element;

	var valid = false;
	
	DataFiles.etc.getPath('MakeCharInfo.img/' + infoName).forEach(function (node) {
		if (objectId === node.getData()) {
			valid = true;
			return false;
		}
	});
	
	return valid;
}

PacketHandler.setHandler(0x0015, function (client, reader) {
	// Check character name
	
	if (!client.account || !client.state) {
		client.disconnect('Trying the check character name while not loggedin');
		return;
	}
	
	var name = reader.readString();
	
	var taken = true;
	if (name.length >= 4 && name.length <= 12) {
		//found = wait.forMethod(Character, 'count', { name: name }) != 0;
		taken = !CheckNameValidity(name, client.account.isAdmin);
	}
	
	var packet = new PacketWriter(0x000D);
	packet.writeString(name);
	packet.writeUInt8(taken); // Taken bool
	
	client.sendPacket(packet);
});


PacketHandler.setHandler(0x0017, function (client, reader) {
	// Deleting character
	if (!client.account || !client.state) {
		client.disconnect('Trying the check character name while not loggedin');
		return;
	}
	
	var pic = reader.readString();
	
	var id = reader.readUInt32();
	var character = findDocumentByCutoffId(Character, id, {
		worldId: client.state.worldId
	});
	
	if (!character) {
		client.disconnect('Character did not exist.');
		return;
	}
	
	if (!client.account.equals(character.account)) {
		client.disconnect('Client tried to delete someone elses character.');
		return;
	}
	
	wait.forMethod(character, 'remove');
	
	var packet = new PacketWriter(0x000F);
	packet.writeUInt32(id);
	packet.writeUInt8(0);
	
	client.sendPacket(packet);
});

function EnterChannel(client, pCharacterId) {
	var world = getWorldInfoById(client.state.worldId);
	
	// Remote-hack vulnerable
	var packet = new PacketWriter(0x000C);
	packet.writeUInt16(0);
	packet.writeBytes(ipStringToBytes(world.publicIP));
	packet.writeUInt16(world.portStart + client.state.channelId);
	packet.writeUInt32(pCharacterId);
	packet.writeUInt8(0); // Flag bit 1 set = korean popup?
	packet.writeUInt32(0); // Minutes left on Internet Cafe?
	
	client.sendPacket(packet);
}

PacketHandler.setHandler(0x0013, function (client, reader) {
	// Select character
	
	if (!client.account || !client.state) {
		client.disconnect();
		return;
	}
	
	var characterId = reader.readUInt32();
	var macAddr = reader.readString();
	var macAddrNoDashes = reader.readString();
	EnterChannel(client, characterId);
});


PacketHandler.setHandler(0x001E, function (client, reader) {
	// Select character using PIC
	
	if (!client.account || !client.state) {
		client.disconnect();
		return;
	}
	var pic = reader.readString();
	
	var characterId = reader.readUInt32();
	var macAddr = reader.readString();
	var macAddrNoDashes = reader.readString();
	EnterChannel(client, characterId);
});


PacketHandler.setHandler(0x0016, function (client, reader) {
	// Create character
	
	if (!client.account || !client.state) {
		client.disconnect();
		return;
	}
	
	var name = reader.readString();
	if (name.length < 4 || name.length > 12) {
		client.disconnect('Name not inside length boundaries. Name: ' + name);
		return;
	}
	
	var type = reader.readUInt32();
	var startJob = 0, startMap = 0;
	if (type === 0) {
		// Cygnus: Noblesse
		startJob = 1000;
		startMap = 130030000;
	}
	else if (type === 2) {
		// Aran: Legend
		startJob = 2000;
		startMap = 914000000;
	}
	
	var eyes = reader.readUInt32();
	var hair = reader.readUInt32();
	var hairColor = reader.readUInt32();
	var skin = reader.readUInt32();
	var top = reader.readUInt32();
	var bottom = reader.readUInt32();
	var shoes = reader.readUInt32();
	var weapon = reader.readUInt32();
	var female = reader.readUInt8() == 1;
	
	function ItemError(pWhat) {
		client.disconnect('[Character Creation] Invalid ' + pWhat);
	}
	
	// Check items
	if (!CheckItemValidity(startJob, female, 0, eyes)) return ItemError('eyes');
	if (!CheckItemValidity(startJob, female, 1, hair)) return ItemError('hair');
	if (!CheckItemValidity(startJob, female, 2, hairColor)) return ItemError('hairColor');
	if (!CheckItemValidity(startJob, female, 3, skin)) return ItemError('skin');
	if (!CheckItemValidity(startJob, female, 4, top)) return ItemError('top');
	if (!CheckItemValidity(startJob, female, 5, bottom)) return ItemError('bottom');
	if (!CheckItemValidity(startJob, female, 6, shoes)) return ItemError('shoes');
	if (!CheckItemValidity(startJob, female, 7, weapon)) return ItemError('weapon');
	
	
	var character = new Character({
		account: client.account,
		worldId: client.state.worldId,
		name: name,
		eyes: eyes,
		hair: hair + hairColor,
		skin: skin,
		female: female,
		
		mapId: startMap,
		mapPos: 0,
		
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
	
	if (top !== 0) CreateItem(top, -5, 1);
	if (bottom !== 0) CreateItem(bottom, -6, 1);
	if (shoes !== 0) CreateItem(shoes, -7, 1);
	if (weapon !== 0) CreateItem(weapon, -11, 1);
	CreateItem(4161001, 1, 2);
	
	
	
	var packet = new PacketWriter(0x000E);
	packet.writeUInt8(0);

	character.addStats(packet);
	character.addAvatar(packet);
	packet.writeUInt8(0); // ?
	packet.writeUInt8(false); // No rankings
	
	client.sendPacket(packet);
});