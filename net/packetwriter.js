require('../helpers.js');

function expandIfNeeded(size) {
	if (this.writtenData + size > this.buffer.length) {
		var oldBuffer = this.buffer;
		var newSize = this.buffer.length;
		
		while (newSize < (this.writtenData + size)) newSize *= 2;
		
		this.buffer = new Buffer(~~newSize);
		oldBuffer.copy(this.buffer);
	}
}

var PacketWriter = function PacketWriter(opCode) {
	this.buffer = new Buffer(32);
	this.writtenData = 0;
	
	if (arguments.length > 0) {
		this.writeUInt16(opCode);
	}
};


PacketWriter.prototype = {
	writeInt8: function (value) {
		expandIfNeeded.call(this, 1);
		this.buffer.writeInt8(value, this.writtenData, true);
		this.writtenData += 1;
		return this;
	},
	
	writeInt16: function (value) {
		expandIfNeeded.call(this, 2);
		this.buffer.writeInt16LE(value, this.writtenData, true);
		this.writtenData += 2;
		return this;
	},
	
	writeInt32: function (value) {
		expandIfNeeded.call(this, 4);
		this.buffer.writeInt32LE(value, this.writtenData, true);
		this.writtenData += 4;
		return this;
	},
	
	writeUInt8: function (value) {
		expandIfNeeded.call(this, 1);
		this.buffer.writeUInt8(value, this.writtenData, true);
		this.writtenData += 1;
		return this;
	},
	
	writeUInt16: function (value) {
		expandIfNeeded.call(this, 2);
		this.buffer.writeUInt16LE(value, this.writtenData, true);
		this.writtenData += 2;
		return this;
	},
	
	writeUInt32: function (value) {
		expandIfNeeded.call(this, 4);
		this.buffer.writeUInt32LE(value, this.writtenData, true);
		this.writtenData += 4;
		return this;
	},
	
	writeFloat32: function (value) {
		expandIfNeeded.call(this, 4);
		this.buffer.writeFloatLE(value, this.writtenData, true);
		this.writtenData += 4;
		return this;
	},
	
	writeFloat64: function (value) {
		expandIfNeeded.call(this, 8);
		this.buffer.writeDoubleLE(value, this.writtenData, true);
		this.writtenData += 8;
		return this;
	},
	
	writeUInt64: function (value) {
		if (!(value instanceof Int64)) {
			if (isNaN(value) || value === null)
				value = 0;
			value = new Int64(value);
		}
		
		this.writeUInt32(value.low32());
		this.writeUInt32(value.high32());
		return this;
	},
	
	writeDate: function (value) {
		this.writeUInt64(getFiletimeFromDate(value));
		return this;
	},
	
	writeString: function (value, length) {
		if (value === null || typeof value === 'undefined')
			value = '';
		if (arguments.length == 1) {
			this.writeUInt16(value.length);
		
			expandIfNeeded.call(this, value.length);
			this.buffer.write(value, this.writtenData, value.length);
			this.writtenData += value.length;
		}
		else {
			expandIfNeeded.call(this, length);
			
			this.buffer.fill(0, this.writtenData, this.writtenData + length);
			this.buffer.write(value, this.writtenData, value.length);
			
			this.writtenData += length;
		}
		return this;
	},
	
	writeBytes: function (value) {
		for (var i = 0; i < value.length; i++) {
			this.writeUInt8(value[i]);
		}
		return this;
	},
	
	writeHexString: function (value) {
		value = value.replace(/[^0-9A-Fa-f]/g, '');
		if ((value.length % 2) !== 0) throw 'HexString is not a valid length. Text: ' + value;
		
		for (var i = 0; i < value.length; i += 2) {
			this.writeUInt8(parseInt(value.substr(i, 2), 16));
		}
		return this;
	},
	
	getBufferCopy: function () {
		var buffer = new Buffer(this.writtenData);
		this.buffer.copy(buffer);
		return buffer;
	}
};

module.exports = PacketWriter;