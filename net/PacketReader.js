exports.PacketReader = function PacketReader(pData) {
	this.buffer = new Buffer(pData.length);
	pData.copy(this.buffer);
	
	this.offset = 0;

	this.ReadInt8 = function () {
		var ret = this.buffer.readInt8(this.offset);
		this.offset += 1;
		return ret;
	};

	this.ReadInt16 = function () {
		var ret = this.buffer.readInt16LE(this.offset);
		this.offset += 2;
		return ret;
	};

	this.ReadInt32 = function () {
		var ret = this.buffer.readInt32LE(this.offset);
		this.offset += 4;
		return ret;
	};

	this.ReadUInt8 = function () {
		var ret = this.buffer.readUInt8(this.offset);
		this.offset += 1;
		return ret;
	};

	this.ReadUInt16 = function () {
		var ret = this.buffer.readUInt16LE(this.offset);
		this.offset += 2;
		return ret;
	};

	this.ReadUInt32 = function () {
		var ret = this.buffer.readUInt32LE(this.offset);
		this.offset += 4;
		return ret;
	};

	this.ReadFloat32 = function () {
		var ret = this.buffer.readFloatLE(this.offset);
		this.offset += 4;
		return ret;
	};

	this.ReadFloat64 = function () {
		var ret = this.buffer.readDoubleLE(this.offset);
		this.offset += 8;
		return ret;
	};

	this.ReadString = function (pLength) {
		pLength = pLength || this.ReadUInt16();
		var ret = '';
		for (; pLength > 0; pLength--) {
			var bytee = this.ReadUInt8();
			if (bytee == 0) break;
			ret += String.fromCharCode(bytee);
		}
		this.offset += pLength;
		return ret;
	};
	
	this.Skip = function (pAmount) {
		this.offset += pAmount;
	};
};