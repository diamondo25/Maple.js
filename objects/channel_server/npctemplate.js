var NpcTemplate = {};

NpcTemplate.Cache = {};

function YYYYMMDD_ToDate(value) {
	var date = new Date();
	date.setUTCFullYear(Math.floor(value / 10000));
	date.setUTCMonth((Math.floor(value / 100) % 100) - 1);
	date.setUTCDate(value % 100);
	date.setUTCHours(0);
	date.setUTCMinutes(0);
	date.setUTCSeconds(0);
	date.setUTCMilliseconds(0);
	return date;
}

NpcTemplate.getNpcTemplate = function (npcId) {
	if (NpcTemplate.Cache.hasOwnProperty(npcId)) return NpcTemplate.Cache[npcId];
	
	var infoNode = DataFiles.npc.getPath(getNXImgName(npcId) + '/info');
	if (infoNode === null) return null;
	
	var stringNXNode = DataFiles.string.getPath('Npc.img/' + npcId);
	if (stringNXNode === null) return null;
	
	while (infoNode.child('link') !== null) {
		var link = infoNode.child('link').getData();
		infoNode = DataFiles.npc.getPath(link + '.img/info');
		if (infoNode === null) return;
	}
	
	var info = {};

	info.name = getOrDefault_NXData(stringNXNode.child('name'), '');
	info.functionName = getOrDefault_NXData(stringNXNode.child('func'), '');
	info.hideName = getOrDefault_NXData(infoNode.child('hideName'), 0) !== 0;
	info.imitate = getOrDefault_NXData(infoNode.child('imitate'), 0) !== 0;
	info.scripts = {};
	info.scriptGlobals = {};
	
	var scriptNode = infoNode.child('script');
	if (scriptNode) {
		scriptNode.forEach(function (script) {
			var start = getOrDefault_NXData(script.child('start'), 19000101);
			var end = getOrDefault_NXData(script.child('end'), 20790101);
			var scriptName = getOrDefault_NXData(script.child('script'), '');
			
			info.scripts[parseInt(script.getName(), 10)] = {
				start: YYYYMMDD_ToDate(start),
				end: YYYYMMDD_ToDate(end),
				script: scriptName
			};
		});
	}

	var regNode = infoNode.child('reg');
	if (regNode) {
		regNode.forEach(function (reg) {
			info.scriptGlobals[reg.getName()] = parseInt(reg.getData(), 10) || 0;
		});
	}
	
	NpcTemplate.Cache[npcId] = info;
	return info;
};

global.NpcTemplate = NpcTemplate;