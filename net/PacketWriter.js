require('../helpers.js');

exports.PacketWriter = function PacketWriter(pOpCode) {
	this.buffer = new Buffer(128);
	this.writtenData = 0;
	
	function ExpandIfNeeded(pSize) {
		if (this.writtenData + pSize > this.buffer.length) {
			var oldBuffer = this.buffer;
			var newSize = this.buffer.length;
			while (newSize < (this.writtenData + pSize)) newSize *= 2;
			this.buffer = new Buffer(~~newSize);
			oldBuffer.copy(this.buffer);
		}
	}
	
	
	this.WriteUInt8 = function (pValue) {
		ExpandIfNeeded.call(this, 1);
		this.buffer.writeUInt8(pValue, this.writtenData, true);
		this.writtenData += 1;
		return this;
	};
	
	this.WriteUInt16 = function (pValue) {
		ExpandIfNeeded.call(this, 2);
		this.buffer.writeUInt16LE(pValue, this.writtenData, true);
		this.writtenData += 2;
		return this;
	};
	
	this.WriteUInt32 = function (pValue) {
		ExpandIfNeeded.call(this, 4);
		this.buffer.writeUInt32LE(pValue, this.writtenData, true);
		this.writtenData += 4;
		return this;
	};
	
	this.WriteUInt64 = function (pValue) {
		if (!(pValue instanceof Int64)) {
			if (isNaN(pValue) || pValue === null)
				pValue = 0;
			pValue = new Int64(pValue);
		}
		
		this.WriteUInt32(pValue.low32());
		this.WriteUInt32(pValue.high32());
		return this;
	};
	
	this.WriteDate = function (pValue) {
		this.WriteUInt64(GetFiletimeFromDate(pValue));
		return this;
	};
	
	this.WriteString = function (pValue, length) {
		if (arguments.length == 1) {
			this.WriteUInt16(pValue.length);
		
			ExpandIfNeeded.call(this, pValue.length);
			this.buffer.write(pValue, this.writtenData, pValue.length);
			this.writtenData += pValue.length;
		}
		else {
			ExpandIfNeeded.call(this, length);
			
			this.buffer.fill(0, this.writtenData, this.writtenData + length);
			this.buffer.write(pValue, this.writtenData, pValue.length);
			
			this.writtenData += length;
		}
		return this;
	};
	
	this.WriteBytes = function (pValue) {
		for (var i = 0; i < pValue.length; i++) {
			this.WriteUInt8(pValue[i]);
		}
		return this;
	};
	
	this.GetBufferCopy = function () {
		var buffer = new Buffer(this.writtenData);
		this.buffer.copy(buffer);
		return buffer;
	};
	
	
	if (arguments.length > 0) {
		this.WriteUInt16(pOpCode);
	}
};