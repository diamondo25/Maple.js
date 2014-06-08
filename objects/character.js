var characterSchema = Mongoose.Schema({
	account: Mongoose.Schema.ObjectId,
	worldId: Number,
	name: String,
	female: Boolean,
	skin: Number,
	eyes: Number,
	hair: Number,
	
	
	mapId: Number,
	mapPos: Number,
	
	stats: {
		level: Number,
		job: Number,
		str: Number,
		dex: Number,
		int: Number,
		luk: Number,
		hp: Number,
		mhp: { type: Number, min: 1 },
		mp: Number,
		mmp: { type: Number, min: 1 },
		ap: Number,
		sp: Number,
		exp: Number,
		fame: Number,
	},
	
	inventory: {
		mesos: Number,
		maxSlots: Array
	}
});


characterSchema.methods.getInventory = function (inventoryIndex) {
	return wait.forMethod(Item, 'find', { character: this, inventory: inventoryIndex });
};

characterSchema.methods.getItem = function (inventoryIndex, slot) {
	return wait.forMethod(Item, 'findOne', { character: this, inventory: inventoryIndex, slot: slot });
};

characterSchema.methods.setItem = function (item) {
	var tmp = this.getItem(item.inventory, item.slot);
	if (tmp) tmp.remove();
	item.character = this; 
	item.save();
};

// Packet helpers

characterSchema.methods.addStats = function addStats(writer) {
	writer.writeUInt32(getDocumentId(this));
	writer.writeString(this.name, 13);
	writer.writeUInt8(this.female);
	writer.writeUInt8(this.skin);
	writer.writeUInt32(this.eyes);
	writer.writeUInt32(this.hair);
	
	writer.writeUInt64(0);
	writer.writeUInt64(0);
	writer.writeUInt64(0);
	
	writer.writeUInt8(this.stats.level);
	writer.writeUInt16(this.stats.job);
	writer.writeUInt16(this.stats.str);
	writer.writeUInt16(this.stats.dex);
	writer.writeUInt16(this.stats.int);
	writer.writeUInt16(this.stats.luk);
	writer.writeUInt16(this.stats.hp);
	writer.writeUInt16(this.stats.mhp); 
	writer.writeUInt16(this.stats.mp);
	writer.writeUInt16(this.stats.mmp); 
	writer.writeUInt16(this.stats.ap); // Byte if evan?
	writer.writeUInt16(this.stats.sp);
	writer.writeUInt32(this.stats.exp);
	writer.writeUInt16(this.stats.fame);
	writer.writeUInt32(0); // Gachapon EXP
	
	writer.writeUInt32(this.mapId);
	writer.writeUInt8(this.mapPos);
	
	writer.writeUInt32(0); // Unk
};


characterSchema.methods.addAvatar = function addAvatar(writer) {
	var index;
	
	// Prepare slots...
	var slots = [];
	slots[0] = {};
	slots[1] = {};
	var cashWeapon = 0;
	
	var inventory = this.getInventory(1);
	for (index in inventory) {
		var item = inventory[index];
		if (item.slot >= 0 || item.slot < -200) continue;
		if (item.slot == -111) cashWeapon = item.itemId;
		
		var slot = Math.abs(item.slot % 100);
		if (slots[0][slot]) {
			slots[1][slot] = item.itemId;
		}
		else {
			slots[0][slot] = item.itemId;
		}
	}
	// Write info
	
	writer.writeUInt8(this.female);
	writer.writeUInt8(this.skin);
	writer.writeUInt32(this.eyes);
	
	writer.writeUInt8(0);
	writer.writeUInt32(this.hair);
	
	for (index in slots[0]) {
		writer.writeUInt8(index);
		writer.writeUInt32(slots[0][index]);
	}
	
	writer.writeUInt8(-1);
	
	for (index in slots[1]) {
		writer.writeUInt8(index);
		writer.writeUInt32(slots[1][index]);
	}
	
	writer.writeUInt8(-1);
	
	writer.writeUInt32(cashWeapon);
	
	// Pet IDs
	writer.writeUInt32(0);
	writer.writeUInt32(0);
	writer.writeUInt32(0);
};

global.Character = Mongoose.model('Character', characterSchema);