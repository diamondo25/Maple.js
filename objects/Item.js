require('mongoose-schema-extend');

var itemSchema = Mongoose.Schema({
	character: { type: Number, ref: 'Character' },
	itemid: Number,
	inventory: Number,
	slot: Number,
	cashId: Number,
	expires: Date
}, { discriminatorKey : '_type' });
global.Item = Mongoose.model('Item', itemSchema);

var petSchema = itemSchema.extend({
	name: String,
	closeness: Number,
	fullness: Number,
	level: Number
});
global.Pet = Mongoose.model('Pet', petSchema);


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
global.Equip = Mongoose.model('Equip', equipSchema);


var rechargeableSchema = itemSchema.extend({
	amount: Number,
	flags: Number,
	uniqueId: Number,
});
global.Rechargeable = Mongoose.model('Rechargeable', rechargeableSchema);