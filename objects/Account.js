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
global.Account = Mongoose.model('Account', accountSchema)
