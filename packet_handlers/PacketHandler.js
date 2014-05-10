var handlers = {};

var opcodeNameValueMap = {};

try {
	opcodeNameValueMap = require('./OpcodeNameValueMap.js').map;
	console.log(opcodeNameValueMap);
}
catch (ex) {
	console.log(ex);
}


function DummyHandler(socket, packet) {
	packet.offset = 0;
	console.log('Unhandled packet: ' + packet.readUInt16().toString(16));
	console.log(packet.buffer);
}

exports.GetHandler = function (opcode) {
	console.log(opcode);
	if (opcode in handlers) return handlers[opcode];
	return DummyHandler;
};

exports.SetHandler = function (opcode, callback) {
	if (typeof opcode === 'string') opcode = opcodeNameValueMap[opcode];
	handlers[opcode] = callback;
	
	console.log('Registered handler for 0x' + opcode.toString(16));
};