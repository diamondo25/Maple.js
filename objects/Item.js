require('mongoose-schema-extend');

var itemSchema = Mongoose.Schema({
	character: { type: Mongoose.Schema.ObjectId, ref: 'Character' },
	itemid: Number,
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
	amount: Number,
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