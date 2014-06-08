require('mongoose-schema-extend');

var itemSchema = Mongoose.Schema({
	character: { type: Mongoose.Schema.ObjectId, ref: 'Character' },
	itemId: Number,
	inventory: Number,
	slot: Number,
	cashId: Number,
	expires: Date
}, { collection : 'items', discriminatorKey : '_type' });

var petSchema = itemSchema.extend({
	name: String,
	closeness: Number,
	fullness: Number,
	level: Number
});


var equipSchema = itemSchema.extend({
	slots: Number,
	scrolls: Number,
	incStr: Number,
	incDex: Number,
	incInt: Number,
	incLuk: Number,
	incMaxHP: Number,
	incMaxMP: Number,
	incWeaponAtk: Number,
	incWeaponDef: Number,
	incMagicAtk: Number,
	incMagicDef: Number,
	incAcc: Number,
	incAvo: Number,
	incHands: Number,
	incJump: Number,
	incSpeed: Number,
	name: String,
	flags: Number,
	
	itemLevel: Number,
	itemExp: Number,
	hammers: Number
});


var rechargeableSchema = itemSchema.extend({
	amount: Number,
	flags: Number,
	uniqueId: Number,
});


global.Equip = Mongoose.model('Equip', equipSchema);
global.Item = Mongoose.model('Item', itemSchema);
global.Pet = Mongoose.model('Pet', petSchema);
global.Rechargeable = Mongoose.model('Rechargeable', rechargeableSchema);

global.writeItemPacketData = function (item, writer) {
	var type = 2;
	if (item instanceof Equip) type = 1;
	else if (item instanceof Pet) type = 3;
	writer.writeUInt8(type);
	writer.writeUInt32(item.itemId);
	
	if (item.cashId) {
		writer.writeUInt8(true);
		writer.writeUInt64(item.cashId);
	}
	else {
		writer.writeUInt8(false);
	}
	writer.writeDate(item.expires);
	
	if (type == 1) {
		writer.writeUInt8(item.slots);
		writer.writeUInt8(item.scrolls);
		writer.writeUInt16(item.incStr);
		writer.writeUInt16(item.incDex);
		writer.writeUInt16(item.incInt);
		writer.writeUInt16(item.incLuk);
		writer.writeUInt16(item.incMaxHP);
		writer.writeUInt16(item.incMaxMP);
		writer.writeUInt16(item.incWeaponAttack);
		writer.writeUInt16(item.incMagicAttack);
		writer.writeUInt16(item.incWeaponDefence);
		writer.writeUInt16(item.incMagicDefence);
		writer.writeUInt16(item.incAcc);
		writer.writeUInt16(item.incAvo);
		writer.writeUInt16(item.incHands);
		writer.writeUInt16(item.incSpeed);
		writer.writeUInt16(item.incJump);
		writer.writeString(item.name);
		writer.writeUInt16(item.flags);
		
		if (item.cashId) {
			writer.writeHexString('91174826F700');
			writer.writeUInt32(0);
		}
		else {
			writer.writeUInt8(0);
			writer.writeUInt8(0);
			writer.writeUInt16(0);
			writer.writeUInt16(0);
			writer.writeUInt32(item.hammers);
			writer.writeUInt64(-1);
		}
		
		writer.writeHexString('0040E0FD3B374F01');
		writer.writeUInt32(-1);
	}
	else if (type == 2) {
		writer.writeUInt16(item.amount);
		writer.writeString(item.name);
		writer.writeUInt16(item.flags);
	}
	
	// Todo: fix this; add rechargeable check
};