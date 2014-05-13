global.Int64 = require('int64-native');

global.GetFiletimeFromDate = function (pDate) {
	if (!(pDate instanceof Date)) return null;
	var rawTime = pDate.getTime();
	rawTime += 11644473600000; // Seconds between 1601-01-01 00:00:00 and 1970-01-01 00:00:00
	rawTime *= 10000; // Convert to nanoseconds
	return new Int64(rawTime);
};

global.GetWorldInfoById = function (pId) {
	for (var name in ServerConfig.worlds) {
		if (ServerConfig.worlds[name].id == pId)
			return ServerConfig.worlds[name];
	}
	return null;
};

global.GetJobTrack = function (pJob) {
	return parseInt(pJob / 100);
};