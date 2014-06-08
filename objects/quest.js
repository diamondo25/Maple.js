var schema = Mongoose.Schema({
	characterId: Mongoose.Schema.ObjectId,
	questId: Number,
	data: String
});

schema.index({ characterId: 1, questId: 1 }, { unique: true });

global.QuestRunning = Mongoose.model('QuestRunning', schema);

var schema = Mongoose.Schema({
	characterId: Mongoose.Schema.ObjectId,
	questId: Number,
	finishedDate: Date
});

schema.index({ characterId: 1, questId: 1 }, { unique: true });

global.QuestFinished = Mongoose.model('QuestFinished', schema);