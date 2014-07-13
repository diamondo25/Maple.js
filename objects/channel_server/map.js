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


function findStringNXMapNode(mapId) {
	var node = null;
	
	DataFiles.string.getPath('Map.img').forEach(function (categoryNode) {
		categoryNode.forEach(function (mapNode) {
			if (mapId == mapNode.getName()) {
				node = mapNode;
				return false;
			}
		});
		if (node !== null) return false;
	});
	
	return node;
}

function Map(nxNode) {
	this.id = parseInt(nxNode.getName(), 10);
	this.clients = [];
	
	var infoBlock = nxNode.child('info');

	var stringNXNode = findStringNXMapNode(this.id);
	this.fieldName = getOrDefault_NXData(stringNXNode.child('mapName'), '');
	this.fieldStreetName = getOrDefault_NXData(stringNXNode.child('streetName'), '');
	
	this.fieldType = getOrDefault_NXData(infoBlock.child('fieldType'), 0);
	this.returnMap = getOrDefault_NXData(infoBlock.child('returnMap'), 999999999);
	this.forcedReturn = getOrDefault_NXData(infoBlock.child('forcedReturn'), 999999999);
	this.mobRate = getOrDefault_NXData(infoBlock.child('mobRate'), 0);
	this.onFirstUserEnter = getOrDefault_NXData(infoBlock.child('onFirstUserEnter'), '');
	this.onUserEnter = getOrDefault_NXData(infoBlock.child('onUserEnter'), '');
	this.lvLimit = getOrDefault_NXData(infoBlock.child('lvLimit'), 0);
	this.lvForceMove = getOrDefault_NXData(infoBlock.child('lvLimit'), 10000);
	this.dropsExpire = getOrDefault_NXData(infoBlock.child('everlast'), 0) === 0;
	
	var realNode = nxNode;
	while (realNode.child('info').child('link')) {
		realNode = getMapNodePath(realNode.child('info').child('link').getData());
	}
	
	
	var portals = {};
	
	(realNode.child('portal') || []).forEach(function (portalNode) {
		var id = parseInt(portalNode.getName(), 10);
		portals[id] = {
			id: id,
			name: getOrDefault_NXData(portalNode.child('pn'), ''),
			type: getOrDefault_NXData(portalNode.child('pt'), ''),
			toMap: getOrDefault_NXData(portalNode.child('tm'), ''),
			toName: getOrDefault_NXData(portalNode.child('tn'), ''),
			script: getOrDefault_NXData(portalNode.child('script'), ''),
			x: getOrDefault_NXData(portalNode.child('x'), 0),
			y: getOrDefault_NXData(portalNode.child('y'), 0)
		};
	});

	this.portals = portals;
	
	
	this.playableMapArea = new PlayableMapArea(nxNode);
	
	this.bounds = this.playableMapArea.bounds;
	this.center = {
		x: this.bounds.right - this.bounds.left,
		y: this.bounds.bottom - this.bounds.top
	};
	
	this.lifePool = new LifePool(this, nxNode);
	
	console.log('Loaded map: ' + this.id);
}

Map.prototype = {
	broadcastPacket: function (packet, skipClient) {
		this.clients.forEach(function (client) {
			if (client === skipClient) return;
			client.sendPacket(packet);
		});
	},
	
	addClient: function (client) {
		this.clients.push(client);

		// Broadcast the user entering
		this.broadcastPacket(packets.map.getEnterMapPacket(client), client);

		// Show other characters for player
		this.clients.forEach(function (loopClient) {
			loopClient.sendPacket(packets.map.getEnterMapPacket(client));
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