export.Character = function Character(base) {
	base = base || {};
	this.id = base.id || new Date().getTime();
	this.name = base.name || 'hurr';
	this.level = base.level || 255;
	this.job = base.job || 512;
	this.female = base.job || false;
	this.skin = base.skin || 0;
	this.eyes = base.eyes || 1;
	this.eyeColor = base.eyeColor || 1;
	this.hair = base.hair || 0;
	
	this.inventories = new Array(5);
	this.inventories[0] = {};
	this.inventories[1] = {};
	this.inventories[2] = {};
	this.inventories[3] = {};
	this.inventories[4] = {};
	
	this.equipped = new Array(2);
	this.equipped[0] = new Uint32Array(52);
	this.equipped[1] = new Uint32Array(52);
	
	
	this.AddCharacterAvatar = function (packet) {
		packet.writeUInt8(this.gender);
		packet.writeUInt8(this.gender);
		packet.writeUInt32(this.eyes + this.eyeColor);
		
		//packet.writeUInt8(1);
		//packet.writeUInt32(1);
	
		for (var i = 0; i < 52; i++) {
			if (this.equipped[1][i] == 0 && this.equipped[0][i] == 0) continue;
			
			packet.writeUInt8(i);
			if (this.equipped[1][i] <= 0 || (i == 11 && this.equipped[0][i] > 0))
				packet.writeUInt32(this.equipped[0][i]);
			else
				packet.writeUInt32(this.equipped[1][i]);
		}
	
		packet.writeUInt8(-1);
		
		for (var i = 0; i < 52; i++) {
			if (!(this.equipped[1][i] > 0 && this.equipped[0][i] > 0 && i != 11)) continue;
			packet.writeUInt8(i);
			packet.writeUInt32(this.equipped[1][i]);
		}
		
		packet.writeUInt8(-1);
		packet.writeUInt32(this.equipped[1][11]);
	};
};