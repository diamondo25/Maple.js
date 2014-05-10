var handlers = {};

function DummyHandler(socket, packet) {
	packet.offset = 0;
	console.log('Unhandled packet: ' + packet.readUInt16().toString(16));
	console.log(packet.buffer);
}

exports.GetHandler = function (opcode) {
	if (opcode in handlers) return handlers[opcode];
	return DummyHandler;
};

exports.SetHandler = function (opcode, callback) {
	handlers[opcode] = callback;
	
	console.log('Registered handler for 0x' + opcode.toString(16));
};