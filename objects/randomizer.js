var Randomizer = function Randomizer() {
	var random = ((Math.random() * ((Math.random() * 100000) % 0x7FFF >>> 0) >>> 0) % 0x7FFF);
	
	var newSeed = 1170746341 * random - 755606699;
	this.seed(newSeed, newSeed, newSeed);
};

Randomizer.prototype.seed = function (s1, s2, s3) {
	this.past_s1 = this.s1 = s1 | 0x100000;
	this.past_s2 = this.s2 = s2 | 0x1000;
	this.past_s3 = this.s3 = s3 | 0x10;
};

Randomizer.prototype.random = function () {
	var a = ((this.s1 & 0xFFFFFFFE) << 12) ^ ((this.s1 & 0x7FFC0 ^ (this.s1 >> 13)) >> 6);
	var b = 16 * (this.s2 & 0xFFFFFFF8) ^ (((this.s2 >> 2) ^ this.s2 & 0x3F800000) >> 23);
	var c = ((this.s3 & 0xFFFFFFF0) << 17) ^ (((this.s3 >> 3) ^ this.s3 & 0x1FFFFF00) >> 8);
	
	this.past_s1 = this.s1;
	this.past_s2 = this.s2;
	this.past_s3 = this.s3;
	
	this.s1 = a;
	this.s2 = b;
	this.s3 = c;
	
	return a ^ b ^ c;
};


global.Randomizer = Randomizer;
global.RandomizerInstance = new Randomizer();