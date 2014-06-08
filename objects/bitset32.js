function BitSet32(bits) {
	this.bits = new Uint32Array(bits / 32);
}

BitSet32.prototype = {
	get: function (bit) {
		var element = (bit / 32) >>> 0;
		var subBit = 1 << (((bit % 32) >>> 0) - 1);
		
		return (this.bits[element] & subBit) !== 0;
	},
	
	set: function (bit) {
		var element = (bit / 32) >>> 0;
		var subBit = 1 << (((bit % 32) >>> 0) - 1);
		
		this.bits[element] |= subBit;
	},
	
	unset: function (bit) {
		var element = (bit / 32) >>> 0;
		var subBit = 1 << (((bit % 32) >>> 0) - 1);
		
		this.bits[element] &= ~(subBit);
	},
	
	
	toBuffer: function () {
		var buffer = new Buffer(this.bits.length * 4);
		buffer.fill(0);
		
		for (var i = 0; i < 4; i++)
			buffer.writeUInt32LE(this.bits[i], i * 4);
	
		return buffer;
	}

};

global.BitSet32 = BitSet32;