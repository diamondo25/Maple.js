var mapCount = 0;
var maps = {};

function GetMapNodePath(pMapId) {
	pMapId = parseInt(pMapId);
	var category = Math.floor(pMapId / 100000000);
	var mapName = AddLeftPadding(pMapId, 9) + '.img';
	return DataFiles.map.GetPath('Map/Map' + category + '/' + mapName);
}

global.GetMap = function GetMap(pMapId) {
	pMapId = parseInt(pMapId);
	if (maps.hasOwnProperty(pMapId)) return maps[pMapId];
	
	var map = GetMapNodePath(pMapId);
	if (map === null)
		maps[pMapId] = null;
	else
		maps[pMapId] = new Map(map);
	
	return maps[pMapId];
};

function Map(pNXNode) {
	this.id = parseInt(pNXNode.GetName());
	
	var infoBlock = pNXNode.Child('info');
	
	this.fieldType = GetOrDefault_NXData(infoBlock.Child('fieldType'), 0);
	this.returnMap = GetOrDefault_NXData(infoBlock.Child('returnMap'), 999999999);
	this.forcedReturn = GetOrDefault_NXData(infoBlock.Child('forcedReturn'), 999999999);
	this.mobRate = GetOrDefault_NXData(infoBlock.Child('mobRate'), 0);
	this.onFirstUserEnter = GetOrDefault_NXData(infoBlock.Child('onFirstUserEnter'), '');
	this.onUserEnter = GetOrDefault_NXData(infoBlock.Child('onUserEnter'), '');
	this.lvLimit = GetOrDefault_NXData(infoBlock.Child('lvLimit'), 0);
	this.lvForceMove = GetOrDefault_NXData(infoBlock.Child('lvLimit'), 10000);
	
	var realNode = pNXNode;
	if (infoBlock.Child('link')) {
		realNode = GetMapNodePath(infoBlock.Child('link').GetData());
	}
	
	
	var portals = {};
	if (realNode.Child('portal')) {
		realNode.Child('portal').ForEach(function (pPortalNode) {
			var id = parseInt(pPortalNode.GetName());
			portals[id] = {
				id: id,
				name: GetOrDefault_NXData(pPortalNode.Child('pn'), ''),
				type: GetOrDefault_NXData(pPortalNode.Child('pt'), ''),
				toMap: GetOrDefault_NXData(pPortalNode.Child('tm'), ''),
				toName: GetOrDefault_NXData(pPortalNode.Child('tn'), ''),
				script: GetOrDefault_NXData(pPortalNode.Child('script'), ''),
				x: GetOrDefault_NXData(pPortalNode.Child('x'), 0),
				y: GetOrDefault_NXData(pPortalNode.Child('y'), 0)
			};
		});
	}
	this.portals = portals;
	
	this.clients = [];
	console.log('Loaded map: ' + this.id);
}

Map.prototype = {
	BroadcastPacket: function (pPacket, pSkipClient) {
		this.clients.forEach(function (client) {
			if (client === pSkipClient) return;
			client.SendPacket(pPacket);
		});
	},
	
	AddClient: function (pClient) {
		this.clients.push(pClient);

		// Broadcast the user entering
		this.BroadcastPacket(MapPackets.GetEnterMapPacket(pClient), pClient);

		// Show other characters for player
		this.clients.forEach(function (client) {
			pClient.SendPacket(MapPackets.GetEnterMapPacket(client));
		});
	},
	
	RemoveClient: function (pClient) {
		this.clients.pop(pClient);

		this.BroadcastPacket(MapPackets.GetLeaveMapPacket(pClient), pClient);
	},

	GetPortalById: function (pId) {
		pId = parseInt(pId);
		if (this.portals.hasOwnProperty(pId)) return this.portals[pId];
		return null;
	},
	
	GetPortalByName: function (pName) {
		for (var index in this.portals) {
			if (this.portals[index].name === pName) return this.portals[index];
		}
		return null;
	}

};