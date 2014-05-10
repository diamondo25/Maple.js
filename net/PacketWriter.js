
exports.PacketWriter = function PacketWriter() {
	this.buffer = new Buffer(128);
	this.writtenData = 0;
	
	this.expandIfNeeded = function (size) {
		if (this.writtenData + size > this.buffer.length) {
			var newBuffer = new Buffer(this.buffer.length * 2);
			
			this.buffer.copy(newBuffer);
			
			this.buffer = newBuffer;
		}
	};
	
	
	this.writeUInt8 = function (value) {
		this.expandIfNeeded(1);
		this.buffer.writeUInt8(value, this.writtenData, true);
		this.writtenData += 1;
		return this;
	};
	
	this.writeUInt16 = function (value) {
		this.expandIfNeeded(2);
		this.buffer.writeUInt16LE(value, this.writtenData, true);
		this.writtenData += 2;
		return this;
	};
	
	this.writeUInt32 = function (value) {
		this.expandIfNeeded(4);
		this.buffer.writeUInt32LE(value, this.writtenData, true);
		this.writtenData += 4;
		return this;
	};
	
	this.writeString = function (value, length) {
		if (arguments.length == 1) {
			this.writeUInt16(value.length);
		
			this.expandIfNeeded(value.length);
			this.buffer.write(value, this.writtenData, value.length);
			this.writtenData += value.length;
		}
		else {
			this.expandIfNeeded(length);
			
			this.buffer.fill(0, this.writtenData, this.writtenData + length);
			this.buffer.write(value, this.writtenData, value.length);
			
			this.writtenData += length;
		}
		return this;
	};
	
	this.writeBytes = function (value) {
		for (var i = 0; i < value.length; i++) {
			this.writeUInt8(value[i]);
		}
		return this;
	};
	
	
	this.getData = function () {
		return this.buffer.slice(0, this.writtenData);
	};
};