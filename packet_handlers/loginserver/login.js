var bcrypt = require('bcrypt'),
	wait = require('wait.for');

PacketHandler.SetHandler(0x0001, function (pSocket, pReader) {
	var username = pReader.ReadString();
	var password = pReader.ReadString();
	
	//Account.findOne({ name: username }, function (pErr, account) {
	
	var packet = new global.PacketWriter(0x0000);
	try {
		var account = wait.forMethod(Account, 'findOne', { name: username });
	
		if (!account) {
			console.log(username + ' login = not found');
			if (!ServerConfig.enableAutoregister) {
				packet.WriteUInt16(5);
				packet.WriteUInt32(0);
			}
			else {
				// Autoregister
				account = new Account({
					name: username,
					password: hash,
					banResetDate: null,
					creationDate: new Date(),
					female: null,
					isAdmin: false
				});
				account.save();
			}
		}
		
		if (!account) {
			pSocket.SendPacket(packet);
			return;
		}
		
		if (typeof account.password === 'undefined') {
			console.log('Updating password');
			account.password = password;
			account.salt = null;
		}
				
		if (account.salt === null) {
			console.log('Generating salt and hash');
			var salt = bcrypt.genSaltSync(10);
			var hash = bcrypt.hashSync(password, salt);
			account.password = hash;
			account.salt = salt;
			account.save();
		}
		
		password = bcrypt.hashSync(password, account.salt);
		
		if (account.loggedIn) {
			console.log(username + ' login = already logged in');
			packet.WriteUInt16(7);
			packet.WriteUInt32(0);
		}
		else if (account.password !== password) {
			console.log(username + ' login = invalid pass');
			packet.WriteUInt16(4);
			packet.WriteUInt32(0);
		}
		else if (account.banResetDate > new Date()) {
			console.log(username + ' login = banned');
			packet.WriteUInt16(2);
			packet.WriteUInt32(0);
			packet.WriteUInt8(account.banReason);
			packet.WriteDate(account.banResetDate);
		}
		else {
			console.log(username + ' login = okay');
			var account = pSocket.account = account;
			packet.WriteUInt16(0);
			packet.WriteUInt32(0);
			
			packet.WriteUInt32(GetIdOfDocument(account));
			packet.WriteUInt8(0);
			packet.WriteUInt8(account.isAdmin); // Admin flag
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
			packet.WriteUInt8(1);
		}
		
	}
	catch (exception) {
		console.log(username + ' login = error');
		packet.WriteUInt16(10); // too many requests
		packet.WriteUInt32(0);
	}
	pSocket.SendPacket(packet);
	//});
});
