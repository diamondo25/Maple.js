
/*
var Item = require('./item.js');


var characterSchema = new Mongoose.Schema({
	internalId: Number,
	account: { type: Number, ref: 'Account' },
	worldId: Number,
	name: String,
	female: Boolean,
	skin: Number,
	eyes: Number,
	hair: Number,
	
	mesos: Number,
	
	mapId: Number,
	mapPos: Number,
	
	maxSlots: Array,
	stats: {
		level: Number,
		job: Number,
		str: Number,
		dex: Number,
		int: Number,
		luk: Number,
		hp: Number,
		mhp: Number,
		mp: Number,
		mmp: Number,
		ap: Number,
		sp: Number,
		exp: Number,
		fame: Number,
	},
});

global.Character = Mongoose.model('Character', characterSchema);

global.Character.methods.AddStats = function (pPacket) {
	pPacket.WriteUInt32(this._id);
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
*/

global.Character = function Character(pValues) {
	pValues = pValues || {};
	this.id = pValues.id || new Date().getTime();
	this.name = pValues.name || 'hurr';
	this.female = pValues.female || false;
	this.skin = pValues.skin || 0;
	this.eyes = pValues.eyes || 20001;
	this.hair = pValues.hair || 30876;
	
	this.mesos = pValues.mesos || 123456789;
	
	this.mapId = pValues.map || 0;
	this.mapPos = pValues.mapPos || 0;
	
	this.maxSlots = new Uint8Array([96, 96, 96, 96, 96]);
	this.inventories = new Array(5);
	this.inventories[0] = {};
	this.inventories[1] = {};
	this.inventories[2] = {};
	this.inventories[3] = {};
	this.inventories[4] = {};
	
	this.equipped = new Array(2);
	this.equipped[0] = new Uint32Array(52);
	this.equipped[1] = new Uint32Array(52);
	
	
	pValues.stats = pValues.stats || {};
	this.stats = {
		level: pValues.stats.level || 1,
		job: pValues.stats.job || 510,
		str: pValues.stats.str || 0,
		dex: pValues.stats.dex || 0,
		int: pValues.stats.int || 0,
		luk: pValues.stats.luk || 0,
		hp: pValues.stats.hp || 50,
		mhp: pValues.stats.mhp || 50,
		mp: pValues.stats.mp || 50,
		mmp: pValues.stats.mmp || 50,
		ap: pValues.stats.ap || 0,
		sp: pValues.stats.sp || 0,
		exp: pValues.stats.exp || 0,
		fame: pValues.stats.fame || 999999
	};
	
	this.AddStats = function (pPacket) {
		pPacket.WriteUInt32(this.id);
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
	
	this.AddAvatar = function (pPacket) {
		pPacket.WriteUInt8(this.female);
		pPacket.WriteUInt8(this.skin);
		pPacket.WriteUInt32(this.eyes);
		
		pPacket.WriteUInt8(0);
		pPacket.WriteUInt32(this.hair);
	
		for (var i = 0; i < 52; i++) {
			if (this.equipped[1][i] == 0 && this.equipped[0][i] == 0) continue;
			
			pPacket.WriteUInt8(i);
			if (this.equipped[1][i] <= 0 || (i == 11 && this.equipped[0][i] > 0))
				pPacket.WriteUInt32(this.equipped[0][i]);
			else
				pPacket.WriteUInt32(this.equipped[1][i]);
		}
	
		pPacket.WriteUInt8(-1);
		
		for (var i = 0; i < 52; i++) {
			if (!(this.equipped[1][i] > 0 && this.equipped[0][i] > 0 && i != 11)) continue;
			pPacket.WriteUInt8(i);
			pPacket.WriteUInt32(this.equipped[1][i]);
		}
		
		pPacket.WriteUInt8(-1);
		pPacket.WriteUInt32(this.equipped[1][11]);
		
		// Pet IDs
		pPacket.WriteUInt32(0);
		pPacket.WriteUInt32(0);
		pPacket.WriteUInt32(0);
	};
};


global.Character.prototype = {
	RandomizeLook: function () {
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
	}


};
