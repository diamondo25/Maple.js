global.MovableLife = function () {
	this.x = 0;
	this.y = 0;
	this.foothold = 0;
	this.stance = 0;
};

global.MovableLife.prototype.DecodeMovePath = function (pPacket, pPreventUpdates) {
	var _x = pPacket.ReadInt16();
	var _y = pPacket.ReadInt16();
	
	var elements = [];
	for (var i = pPacket.ReadUInt8(); i > 0; i--) {
		var type = pPacket.ReadUInt8();
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
				element.x = pPacket.ReadInt16();
				element.y = pPacket.ReadInt16();
				element.velocityX = pPacket.ReadInt16();
				element.velocityY = pPacket.ReadInt16();
				element.flushDelay = pPacket.ReadInt16();
				if (type == 0xF) {
					element.unknown2 = pPacket.ReadUInt16();
				}
				element.stance = pPacket.ReadUInt8();
				element.foothold = pPacket.ReadUInt16();
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
				element.velocityX = pPacket.ReadInt16();
				element.velocityY = pPacket.ReadInt16();
				element.stance = pPacket.ReadUInt8();
				element.foothold = pPacket.ReadUInt16();
				break;
			
			case 3:
			case 4:
			case 7:
			case 8:
			case 9:
			case 0xB:
				element.x = pPacket.ReadInt16();
				element.y = pPacket.ReadInt16();
				element.flushDelay = pPacket.ReadInt16();
				element.stance = pPacket.ReadUInt8();
				element.foothold = pPacket.ReadUInt16();
				_x = element.x;
				_y = element.y;
				break;
				
			case 0xE:
				element.x = _x;
				element.y = _y;
				element.velocityX = pPacket.ReadInt16();
				element.velocityY = pPacket.ReadInt16();
				
				element.unknown2 = pPacket.ReadUInt16();
				
				element.stance = pPacket.ReadUInt8();
				element.foothold = pPacket.ReadUInt16();
				
				_x = element.x;
				_y = element.y;
				break;

			case 0xA:
				element.unknown1 = pPacket.ReadUInt8();
				element.x = _x;
				element.y = _y;
				break;
			
			default:
				element.stance = pPacket.ReadUInt8();
				element.foothold = pPacket.ReadUInt16();
				
				_x = element.x;
				_y = element.y;
				break;
				
		}
		
		if (!pPreventUpdates) {
			if (element.x !== null) this.x = element.x;
			if (element.y !== null) this.y = element.y;
			if (element.foothold !== null) this.foothold = element.foothold;
			if (element.stance !== null) this.stance = element.stance;
		}
		elements.push(element);
	}
	
	return elements;
};



global.MovableLife.EncodeMovePath = function (pMovePath, pPacket) {
	pPacket.WriteUInt8(pMovePath.length);

	for (var i = 0; i < pMovePath.length; i++) {
		
		var element = pMovePath[i];
		var type = element.type;
		pPacket.WriteUInt8(type);
	
		switch (type) {
			case 0:
			case 5:
			case 0xF:
			case 0x11:
				pPacket.WriteInt16(element.x);
				pPacket.WriteInt16(element.y);
				pPacket.WriteInt16(element.velocityX);
				pPacket.WriteInt16(element.velocityY);
				pPacket.WriteInt16(element.flushDelay);
				if (type == 0xF) {
					pPacket.WriteUInt16(element.unknown2);
				}
				pPacket.WriteUInt8(element.stance);
				pPacket.WriteUInt16(element.foothold);
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
				pPacket.WriteInt16(element.velocityX);
				pPacket.WriteInt16(element.velocityY);
				pPacket.WriteUInt8(element.stance);
				pPacket.WriteUInt16(element.foothold);
				break;
			
			case 3:
			case 4:
			case 7:
			case 8:
			case 9:
			case 0xB:
				pPacket.WriteInt16(element.x);
				pPacket.WriteInt16(element.y);
				pPacket.WriteInt16(element.flushDelay);
				pPacket.WriteUInt8(element.stance);
				pPacket.WriteUInt16(element.foothold);
				break;
				
			case 0xE:
				pPacket.WriteInt16(element.velocityX);
				pPacket.WriteInt16(element.velocityY);
				
				pPacket.WriteUInt16(element.unknown2);
				
				pPacket.WriteUInt8(element.stance);
				pPacket.WriteUInt16(element.foothold);
				break;

			case 0xA:
				pPacket.WriteUInt8(element.unknown1);
				break;
			
			default:
				pPacket.WriteUInt8(element.stance);
				pPacket.WriteUInt16(element.foothold);
				break;
				
		}
	}
};
