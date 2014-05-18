global.Account = function Account(pValues) {
	pValues = pValues || {};
	
	this.id = pValues.id || -1;
	this.name = pValues.name || 'UnkUser';
	this.female = pValues.female || false;
	this.gradeCode = pValues.gradeCode || 0;
	this.countryId = pValues.countryId || 0;
	
	this.creationDate = pValues.creationDate || new Date();
	this.banReason = pValues.banReason || 0;
	this.banResetDate = pValues.banResetDate || null;
	
	this.muteReason = pValues.muteReason || 0;
	this.muteResetDate = pValues.muteResetDate || null;

};