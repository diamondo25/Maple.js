function BitSet32(pBits) {
	this.bits = new Uint32Array(pBits / 32);
}

BitSet32.prototype = {
	Get: function (pBit) {
		var element = (pBit / 32) >>> 0;
		var bit = 1 << (((pBit % 32) >>> 0) - 1);
		
		return (this.bits[element] & bit) != 0;
	},
	
	Set: function (pBit) {
		var element = (pBit / 32) >>> 0;
		var bit = 1 << (((pBit % 32) >>> 0) - 1);
		
		this.bits[element] |= bit;
	},
	
	Unset: function (pBit) {
		var element = (pBit / 32) >>> 0;
		var bit = 1 << (((pBit % 32) >>> 0) - 1);
		
		this.bits[element] &= ~(bit);
	},
	
	
	ToBuffer: function () {
		var buffer = new Buffer(this.bits.length * 4);
		buffer.fill(0);
		
		for (var i = 0; i < 4; i++)
			buffer.writeUInt32LE(this.bits[i], i * 4);
	
		return buffer;
	}

};

global.BitSet32 = BitSet32;