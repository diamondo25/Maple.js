require('./Item.js');
var wait = require('wait.for');

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


characterSchema.methods.GetInventory = function (pInventoryIndex) {
	console.log(wait.forMethod(Item, 'find'));
	return wait.forMethod(Item, 'find', { character: this, inventory: pInventoryIndex });
};

characterSchema.methods.GetItem = function (pInventoryIndex, pSlot) {
	return wait.forMethod(Item, 'findOne', { character: this, inventory: pInventoryIndex, slot: pSlot });
};

characterSchema.methods.SetItem = function (pItem) {
	var tmp = this.GetItem(pItem.inventory, pItem.slot);
	if (tmp) tmp.remove();
	pItem.character = this; 
	pItem.save();
};

// Packet helpers

characterSchema.methods.AddStats = function AddStats(pPacket) {
	pPacket.WriteUInt32(GetIdOfDocument(this));
	pPacket.WriteString(this.name, 13);
	pPacket.WriteUInt8(this.female);
	pPacket.WriteUInt8(this.skin);
	pPacket.WriteUInt32(this.eyes);
	pPacket.WriteUInt32(this.hair);
	
	pPacket.WriteUInt64(0);
	pPacket.WriteUInt64(0);
	pPacket.WriteUInt64(0);
	
	pPacket.WriteUInt8(this.stats.level);
	pPacket.WriteUInt16(this.stats.job);
	pPacket.WriteUInt16(this.stats.str);
	pPacket.WriteUInt16(this.stats.dex);
	pPacket.WriteUInt16(this.stats.int);
	pPacket.WriteUInt16(this.stats.luk);
	pPacket.WriteUInt16(this.stats.hp);
	pPacket.WriteUInt16(this.stats.mhp); 
	pPacket.WriteUInt16(this.stats.mp);
	pPacket.WriteUInt16(this.stats.mmp); 
	pPacket.WriteUInt16(this.stats.ap); // Byte if evan?
	pPacket.WriteUInt16(this.stats.sp);
	pPacket.WriteUInt32(this.stats.exp);
	pPacket.WriteUInt16(this.stats.fame);
	pPacket.WriteUInt32(0); // Gachapon EXP
	
	pPacket.WriteUInt32(this.mapId);
	pPacket.WriteUInt8(this.mapPos);
	
	pPacket.WriteUInt32(0); // Unk
};


characterSchema.methods.AddAvatar = function AddAvatar(pPacket) {
	// Prepare slots...
	var slots = [];
	slots[0] = {};
	slots[1] = {};
	var cashWeapon = 0;
	
	var inventory = this.GetInventory(1);
	for (var index in inventory) {
		var item = inventory[index];
		if (item.slot >= 0 || item.slot < -200) continue;
		if (item.slot == -111) cashWeapon = item.itemid;
		
		var slot = Math.abs(item.slot % 100);
		if (slots[0][slot]) {
			slots[1][slot] = item.itemid;
		}
		else {
			slots[0][slot] = item.itemid;
		}
	}
	// Write info
	
	pPacket.WriteUInt8(this.female);
	pPacket.WriteUInt8(this.skin);
	pPacket.WriteUInt32(this.eyes);
	
	pPacket.WriteUInt8(0);
	pPacket.WriteUInt32(this.hair);
	
	for (var index in slots[0]) {
		pPacket.WriteUInt8(index);
		pPacket.WriteUInt32(slots[0][index]);
	}
	
	pPacket.WriteUInt8(-1);
	
	for (var index in slots[1]) {
		pPacket.WriteUInt8(index);
		pPacket.WriteUInt32(slots[1][index]);
	}
	
	pPacket.WriteUInt8(-1);
	
	pPacket.WriteUInt32(cashWeapon);
	
	// Pet IDs
	pPacket.WriteUInt32(0);
	pPacket.WriteUInt32(0);
	pPacket.WriteUInt32(0);
};

characterSchema.methods.RandomizeLook = function RandomizeLook() {
	var charnx = DataFiles.character;
	{
		var dir = charnx.Child('Face');
		var amount = dir.child_count;
		var id = Math.floor(amount * Math.random());
		this.eyes = parseInt(dir.ChildById(id).GetName());
	}
	{
		var dir = charnx.Child('Hair');
		var amount = dir.child_count;
		var id = Math.floor(amount * Math.random());
		this.hair = parseInt(dir.ChildById(id).GetName());
	}
	this.save();
};


global.Character = Mongoose.model('Character', characterSchema);