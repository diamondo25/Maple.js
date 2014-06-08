var mapCount = 0;
var maps = {};

function getMapNodePath(mapId) {
	mapId = parseInt(mapId, 10);
	var category = Math.floor(mapId / 100000000);
	var maname = addLeftPadding(mapId, 9) + '.img';
	return DataFiles.map.getPath('Map/Map' + category + '/' + maname);
}

global.getMap = function getMap(mapId) {
	mapId = parseInt(mapId, 10);
	if (maps.hasOwnProperty(mapId)) return maps[mapId];
	
	var map = getMapNodePath(mapId);
	if (map === null)
		maps[mapId] = null;
	else
		maps[mapId] = new Map(map);
	
	return maps[mapId];
};

function Map(nxNode) {
	this.id = parseInt(nxNode.getName(), 10);
	
	var infoBlock = nxNode.child('info');
	
	this.fieldType = getOrDefault_NXData(infoBlock.child('fieldType'), 0);
	this.returnMap = getOrDefault_NXData(infoBlock.child('returnMap'), 999999999);
	this.forcedReturn = getOrDefault_NXData(infoBlock.child('forcedReturn'), 999999999);
	this.mobRate = getOrDefault_NXData(infoBlock.child('mobRate'), 0);
	this.onFirstUserEnter = getOrDefault_NXData(infoBlock.child('onFirstUserEnter'), '');
	this.onUserEnter = getOrDefault_NXData(infoBlock.child('onUserEnter'), '');
	this.lvLimit = getOrDefault_NXData(infoBlock.child('lvLimit'), 0);
	this.lvForceMove = getOrDefault_NXData(infoBlock.child('lvLimit'), 10000);
	
	var realNode = nxNode;
	while (realNode.child('info').child('link')) {
		realNode = getMapNodePath(realNode.child('info').child('link').getData());
	}
	
	
	var portals = {};
	if (realNode.child('portal')) {
		realNode.child('portal').forEach(function (pPortalNode) {
			var id = parseInt(pPortalNode.getName());
			portals[id] = {
				id: id,
				name: getOrDefault_NXData(pPortalNode.child('pn'), ''),
				type: getOrDefault_NXData(pPortalNode.child('pt'), ''),
				toMap: getOrDefault_NXData(pPortalNode.child('tm'), ''),
				toName: getOrDefault_NXData(pPortalNode.child('tn'), ''),
				script: getOrDefault_NXData(pPortalNode.child('script'), ''),
				x: getOrDefault_NXData(pPortalNode.child('x'), 0),
				y: getOrDefault_NXData(pPortalNode.child('y'), 0)
			};
		});
	}
	this.portals = portals;
	
	this.clients = [];
	console.log('Loaded map: ' + this.id);
}

Map.prototype = {
	broadcastPacket: function (packet, skiclient) {
		this.clients.forEach(function (client) {
			if (client === skiclient) return;
			client.sendPacket(packet);
		});
	},
	
	addClient: function (client) {
		this.clients.push(client);

		// Broadcast the user entering
		this.broadcastPacket(packets.map.getEnterMapPacket(client), client);

		// Show other characters for player
		this.clients.forEach(function (client) {
			client.sendPacket(packets.map.getEnterMapPacket(client));
		});
	},
	
	removeClient: function (client) {
		this.clients.pop(client);

		this.broadcastPacket(packets.map.getLeaveMapPacket(client), client);
	},

	getPortalById: function (id) {
		id = parseInt(id, 10);
		if (this.portals.hasOwnProperty(id)) return this.portals[id];
		return null;
	},
	
	getPortalByName: function (name) {
		for (var index in this.portals) {
			if (this.portals[index].name === name) return this.portals[index];
		}
		return null;
	}

};