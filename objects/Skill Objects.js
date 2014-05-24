var skillSchema = Mongoose.Schema({
	characterId: Mongoose.Schema.ObjectId,
	skillId: Number,
	points: Number,
	expires: Date,
	maxLevel: Number
});

skillSchema.index({ characterId: 1, skillId: 1}, { unique: true });

global.Skill = Mongoose.model('Skill', skillSchema);

var schema = Mongoose.Schema({
	characterId: Mongoose.Schema.ObjectId,
	skillId: Number,
	expires: Date
});

schema.index({ characterId: 1, skillId: 1}, { unique: true });

global.Cooldown = Mongoose.model('Cooldown', schema);