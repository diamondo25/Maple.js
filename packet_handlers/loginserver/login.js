PacketHandler.SetHandler(0x0001, function (pSocket, pReader) {
	console.log('LoginPacket');
	var username = pReader.ReadString();
	var password = pReader.ReadString();

	
	var account = pSocket.account = new Account({
		name: username
	});
	
	var packet = new global.PacketWriter(0x0000);
	
	if (account.banResetDate !== null) {
		packet.WriteUInt16(2);
		packet.WriteUInt32(0);
		packet.WriteUInt8(account.banReason);
		packet.WriteDate(account.banResetDate);
	}
	else {
		packet.WriteUInt16(0);
		packet.WriteUInt32(0);
		
		packet.WriteUInt32(account.id);
		packet.WriteUInt8(0);
		packet.WriteUInt8(true); // Admin flag
		packet.WriteUInt8(1);
		packet.WriteUInt8(1);
		packet.WriteString(account.name);
		packet.WriteUInt8(1);
		packet.WriteUInt8(account.muteReason);
		packet.WriteDate(account.muteResetDate);
		
		packet.WriteDate(account.creationDate);
		
		packet.WriteUInt32(0);
		
		// PIC info
		packet.WriteUInt8(true);
		packet.WriteUInt8(2);
		
	}
	pSocket.SendPacket(packet);
	
});
