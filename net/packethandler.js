var PacketHandler = {};

var _handlers = {};
var _handlerCount = 0;

function handlerNotFoundHandler(client, packet) {
	packet.offset = 0;
	console.log('Unhandled packet: ' + packet.readUInt16().toString(16));
	console.log(packet.buffer);
}

PacketHandler.getHandler = function (opCode) {
	if (opCode in _handlers) return _handlers[opCode];
	return handlerNotFoundHandler;
};

PacketHandler.setHandler = function (opCode, callback) {
	if (_handlers[opCode] === undefined) _handlerCount++;
	_handlers[opCode] = callback;
	
	console.log('Registered handler for 0x' + opCode.toString(16));
};

PacketHandler.getHandlerCount = function () {
	return _handlerCount;
};

module.exports = PacketHandler;