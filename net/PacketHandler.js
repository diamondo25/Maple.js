var handlers = {};

function DummyHandler(pSocket, pPacket) {
	pPacket.offset = 0;
	console.log('Unhandled packet: ' + pPacket.ReadUInt16().toString(16));
	console.log(pPacket.buffer);
}

exports.GetHandler = function (pOpCode) {
	if (pOpCode in handlers) return handlers[pOpCode];
	return DummyHandler;
};

exports.SetHandler = function (pOpCode, pCallback) {
	handlers[pOpCode] = pCallback;
	
	console.log('Registered handler for 0x' + pOpCode.toString(16));
};