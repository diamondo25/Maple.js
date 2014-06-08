var bcrypt = require('bcrypt'),
	wait = require('wait.for');

PacketHandler.setHandler(0x0001, function (client, reader) {
	var username = reader.readString();
	var password = reader.readString();
	
	var packet = new global.PacketWriter(0x0000);
	try {
		var account = wait.forMethod(Account, 'findOne', { name: username });
	
		if (!account) {
			console.log(username + ' login = not found');
			if (!ServerConfig.enableAutoregister) {
				packet.writeUInt16(5);
				packet.writeUInt32(0);
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
			client.sendPacket(packet);
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
			packet.writeUInt16(7);
			packet.writeUInt32(0);
		}
		else if (account.password !== password) {
			console.log(username + ' login = invalid pass');
			packet.writeUInt16(4);
			packet.writeUInt32(0);
		}
		else if (account.banResetDate > new Date()) {
			console.log(username + ' login = banned');
			packet.writeUInt16(2);
			packet.writeUInt32(0);
			packet.writeUInt8(account.banReason);
			packet.writeDate(account.banResetDate);
		}
		else {
			console.log(username + ' login = okay');
			client.account = account;
			packet.writeUInt16(0);
			packet.writeUInt32(0);
			
			packet.writeUInt32(getDocumentId(account));
			packet.writeUInt8(0);
			packet.writeUInt8(account.isAdmin ? 0x40 : 0); // Admin flag
			packet.writeUInt8(0);
			packet.writeUInt8(0);
			packet.writeString(account.name);
			packet.writeUInt8(0);
			packet.writeUInt8(account.muteReason);
			packet.writeDate(account.muteResetDate);
			
			packet.writeDate(account.creationDate);
			
			packet.writeUInt32(0);
			
			// PIC info
			packet.writeUInt8(true);
			packet.writeUInt8(1);
		}
		
	}
	catch (exception) {
		console.log(username + ' login = error');
		console.error(exception, exception.stacktrace);
		packet.writeUInt16(10); // too many requests
		packet.writeUInt32(0);
	}
	
	client.sendPacket(packet);
});
