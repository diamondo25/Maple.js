var MovableLife = function () {
	this.x = 0;
	this.y = 0;
	this.foothold = 0;
	this.stance = 0;
	
	this.previousX = 0;
	this.previousY = 0;
};

MovableLife.prototype.decodeMovePath = function (reader, preventUpdates) {
	if (!preventUpdates) {
		this.previousX = this.x;
		this.previousY = this.y;
	}
	var _x = reader.readInt16();
	var _y = reader.readInt16();
	
	var elements = [];
	for (var i = reader.readUInt8(); i > 0; i--) {
		var type = reader.readUInt8();
		var element = {
			type: type,
			x: null,
			y: null,
			velocityX: null,
			velocityY: null,
			stance: null,
			foothold: null,
			flushDelay: null,
			unknown1: null,
			unknown2: null
		};
	
		switch (type) {
			case 0:
			case 5:
			case 0xF:
			case 0x11:
				element.x = reader.readInt16();
				element.y = reader.readInt16();
				element.velocityX = reader.readInt16();
				element.velocityY = reader.readInt16();
				element.flushDelay = reader.readInt16();
				if (type == 0xF) {
					element.unknown2 = reader.readUInt16();
				}
				element.stance = reader.readUInt8();
				element.foothold = reader.readUInt16();
				_x = element.x;
				_y = element.y;
				break;

			case 1:
			case 2:
			case 6:
			case 0xC:
			case 0xD:
			case 0x10:
			case 0x12:
			case 0x13:
			case 0x14:
			case 0x16:
				element.x = _x;
				element.y = _y;
				element.velocityX = reader.readInt16();
				element.velocityY = reader.readInt16();
				element.stance = reader.readUInt8();
				element.foothold = reader.readUInt16();
				break;
			
			case 3:
			case 4:
			case 7:
			case 8:
			case 9:
			case 0xB:
				element.x = reader.readInt16();
				element.y = reader.readInt16();
				element.flushDelay = reader.readInt16();
				element.stance = reader.readUInt8();
				element.foothold = reader.readUInt16();
				_x = element.x;
				_y = element.y;
				break;
				
			case 0xE:
				element.x = _x;
				element.y = _y;
				element.velocityX = reader.readInt16();
				element.velocityY = reader.readInt16();
				
				element.unknown2 = reader.readUInt16();
				
				element.stance = reader.readUInt8();
				element.foothold = reader.readUInt16();
				
				_x = element.x;
				_y = element.y;
				break;

			case 0xA:
				element.unknown1 = reader.readUInt8();
				element.x = _x;
				element.y = _y;
				break;
			
			default:
				element.stance = reader.readUInt8();
				element.foothold = reader.readUInt16();
				
				_x = element.x;
				_y = element.y;
				break;
				
		}
		
		if (!preventUpdates) {
			if (element.x !== null) this.x = element.x;
			if (element.y !== null) this.y = element.y;
			if (element.foothold !== null) this.foothold = element.foothold;
			if (element.stance !== null) this.stance = element.stance;
		}
		elements.push(element);
	}
	
	return elements;
};


MovableLife.encodeMovePath = function (movePath, writer) {
	writer.writeUInt16(this.previousX);
	writer.writeUInt16(this.previousY);
	
	writer.writeUInt8(movePath.length);

	for (var i = 0; i < movePath.length; i++) {
		var element = movePath[i];
		
		var type = element.type;
		writer.writeUInt8(type);
	
		switch (type) {
			case 0:
			case 5:
			case 0xF:
			case 0x11:
				writer.writeInt16(element.x);
				writer.writeInt16(element.y);
				writer.writeInt16(element.velocityX);
				writer.writeInt16(element.velocityY);
				writer.writeInt16(element.flushDelay);
				if (type == 0xF) {
					writer.writeUInt16(element.unknown2);
				}
				writer.writeUInt8(element.stance);
				writer.writeUInt16(element.foothold);
				break;

			case 1:
			case 2:
			case 6:
			case 0xC:
			case 0xD:
			case 0x10:
			case 0x12:
			case 0x13:
			case 0x14:
			case 0x16:
				writer.writeInt16(element.velocityX);
				writer.writeInt16(element.velocityY);
				writer.writeUInt8(element.stance);
				writer.writeUInt16(element.foothold);
				break;
			
			case 3:
			case 4:
			case 7:
			case 8:
			case 9:
			case 0xB:
				writer.writeInt16(element.x);
				writer.writeInt16(element.y);
				writer.writeInt16(element.flushDelay);
				writer.writeUInt8(element.stance);
				writer.writeUInt16(element.foothold);
				break;
				
			case 0xE:
				writer.writeInt16(element.velocityX);
				writer.writeInt16(element.velocityY);
				
				writer.writeUInt16(element.unknown2);
				
				writer.writeUInt8(element.stance);
				writer.writeUInt16(element.foothold);
				break;

			case 0xA:
				writer.writeUInt8(element.unknown1);
				break;
			
			default:
				writer.writeUInt8(element.stance);
				writer.writeUInt16(element.foothold);
				break;
				
		}
	}
};

global.MovableLife = MovableLife;
