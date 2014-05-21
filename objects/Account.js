var wait = require('wait.for');

var accountSchema = Mongoose.Schema({
	name: String,
	password: String,
	salt: { type: String, default: null },
	female: Boolean,
	creationDate: Date,
	banReason: Number,
	banResetDate: Date,
	muteReason: Number,
	muteResetDate: Date,
	isAdmin: Boolean,
	loggedIn: Boolean
});

accountSchema.methods.GetCharacters = function (pWorldId) {
	return wait.forMethod(Character, 'find', { account: this, worldId: pWorldId });
};

global.Account = Mongoose.model('Account', accountSchema)
