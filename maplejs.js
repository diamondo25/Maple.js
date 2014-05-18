global.ServerConfig = require('./config.json');

// Start servers

var child_process = require('child_process');

function SpawnInstance(pLoggerName, pProcessName, pArguments) {
	console.log('Spawning ' + pProcessName + ' ' + pArguments.join(' '));
	var instance = child_process.spawn(pProcessName, pArguments);
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

for (var index in ServerConfig.loginservers) {
	var instanceName = 'loginserver-' + index;
	var loginserver = ServerConfig.loginservers[index];
	instances[instanceName] = SpawnInstance('Login-' + (index + 1), 'node', ['login_server', instanceName, loginserver.port]);
}

for (var worldName in ServerConfig.worlds) {
	var world = ServerConfig.worlds[worldName];
	var instanceName = 'world-' + worldName + '-';
	for (var i = 0; i < world.channels; i++) {
		instances[instanceName + i] = SpawnInstance(worldName + '-' + (i + 1), 'node', ['channel_server', instanceName + i, world.portStart + i, world.id, i]);
	}
}

console.log('Ready...');