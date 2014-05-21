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

global.WriteItemPacketData = function (pItem, pPacket) {
	var type = 2;
	if (pItem instanceof Equip) type = 1;
	else if (pItem instanceof Pet) type = 3;
	pPacket.WriteUInt8(type);
	pPacket.WriteUInt32(pItem.itemId);
	
	if (pItem.cashId) {
		pPacket.WriteUInt8(true);
		pPacket.WriteUInt64(pItem.cashId);
	}
	else {
		pPacket.WriteUInt8(false);
	}
	pPacket.WriteDate(pItem.expires);
	
	if (type == 1) {
		pPacket.WriteUInt8(pItem.slots);
		pPacket.WriteUInt8(pItem.scrolls);
		pPacket.WriteUInt16(pItem.incStr);
		pPacket.WriteUInt16(pItem.incDex);
		pPacket.WriteUInt16(pItem.incInt);
		pPacket.WriteUInt16(pItem.incLuk);
		pPacket.WriteUInt16(pItem.incMaxHP);
		pPacket.WriteUInt16(pItem.incMaxMP);
		pPacket.WriteUInt16(pItem.incWeaponAttack);
		pPacket.WriteUInt16(pItem.incMagicAttack);
		pPacket.WriteUInt16(pItem.incWeaponDefence);
		pPacket.WriteUInt16(pItem.incMagicDefence);
		pPacket.WriteUInt16(pItem.incAcc);
		pPacket.WriteUInt16(pItem.incAvo);
		pPacket.WriteUInt16(pItem.incHands);
		pPacket.WriteUInt16(pItem.incSpeed);
		pPacket.WriteUInt16(pItem.incJump);
		pPacket.WriteString(pItem.name);
		pPacket.WriteUInt16(pItem.flags);
		
		if (pItem.cashId) {
			pPacket.WriteHexString('91174826F700');
			pPacket.WriteUInt32(0);
		}
		else {
			pPacket.WriteUInt8(0);
			pPacket.WriteUInt8(0);
			pPacket.WriteUInt16(0);
			pPacket.WriteUInt16(0);
			pPacket.WriteUInt32(pItem.hammers);
			pPacket.WriteUInt64(-1);
		}
		
		pPacket.WriteHexString('0040E0FD3B374F01');
		pPacket.WriteUInt32(-1);
	}
	else if (type == 2) {
		pPacket.WriteUInt16(pItem.amount);
		pPacket.WriteString(pItem.name);
		pPacket.WriteUInt16(pItem.flags);
	}
	
	// Todo: fix this; add rechargeable check
};