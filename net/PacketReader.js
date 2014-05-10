exports.PacketReader = function PacketReader(data) {
	this.buffer = new Buffer(data.length);
	data.copy(this.buffer);
	
	this.offset = 0;

	this.readUInt8 = function () {
		var ret = this.buffer.readUInt8(this.offset);
		this.offset += 1;
		return ret;
	};

	this.readUInt16 = function () {
		var ret = this.buffer.readUInt16LE(this.offset);
		this.offset += 2;
		return ret;
	};

	this.readUInt32 = function () {
		var ret = this.buffer.readUInt32LE(this.offset);
		this.offset += 4;
		return ret;
	};

	this.readString = function (len) {
		len = len || this.readUInt16();
		var ret = '';
		for (; len > 0; len--) {
			var bytee = this.readUInt8();
			if (bytee == 0) break;
			ret += String.fromCharCode(bytee);
		}
		this.offset += len;
		return ret;
	};
};