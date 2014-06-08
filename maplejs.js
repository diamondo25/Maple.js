global.ServerConfig = require('./config.json');

var startLoginServers = true;
var startChannelServers = true;

for (var i = 2; i < process.argv.length; i++) {
	switch (process.argv[i]) {
		case 'no_logins': startLoginServers = false; break;
		case 'no_channels': startChannelServers = false; break;
	}
}

// Start servers

var child_process = require('child_process');

function spawnInstance(pLoggerName, pProcessName, arguments) {
	console.log('Spawning ' + pProcessName + ' ' + arguments.join(' '));
	var instance = child_process.spawn(pProcessName, arguments);
	
	instance.stdout.setEncoding('utf8');
	instance.stdout.on('data', function (pData) {
		var lines = pData.split("\n");
		lines.forEach(function (pLine) {
			if (pLine == '') return;
			console.log('[' + pLoggerName +'] ' + pLine);
		});
	});

	instance.stderr.setEncoding('utf8');
	instance.stderr.on('data', function (pData) {
		var lines = pData.split("\n");
		lines.forEach(function (pLine) {
			if (pLine == '') return;
			console.log('[' + pLoggerName +'][ERROR] ' + pLine);
		});
	});

	instance.on('close', function (code) {
		console.log('[' + pLoggerName +'][EXIT] code ' + code);
	});
}

var instances = {};

if (startLoginServers) {
	for (var index in ServerConfig.loginservers) {
		var instanceName = 'loginserver-' + index;
		var loginserver = ServerConfig.loginservers[index];
		instances[instanceName] = spawnInstance('Login-' + (parseInt(index) + 1), 'node', ['login_server', instanceName, loginserver.port]);
	}
}

if (startChannelServers) {
	for (var worldName in ServerConfig.worlds) {
		var world = ServerConfig.worlds[worldName];
		var instanceName = 'world-' + worldName + '-';
		for (var i = 0; i < world.channels; i++) {
			instances[instanceName + i] = spawnInstance(worldName + '-' + (i + 1), 'node', ['channel_server', instanceName + i, world.portStart + i, world.id, i]);
		}
	}
}
console.log('Ready...');