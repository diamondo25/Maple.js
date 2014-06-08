var packets = {};

['map', 'player'].forEach(function (item) {
	console.log('./packets/' + item + '.js');
	packets[item] = require('./packets/' + item + '.js');
});

global.packets = packets;