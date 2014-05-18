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

global.IPStringToBytes = function (pIP) {
	var ipParts = pIP.split('.');
	return [parseInt(ipParts[0]), parseInt(ipParts[1]), parseInt(ipParts[2]), parseInt(ipParts[3])];
};

global.CheckFileFilter = function (pFileName, pFilters) {
	for (var filter in pFilters) {
		var curFilter = pFilters[filter];
		var okay = false;
		if (curFilter.length == 1) {
			if (curFilter[0] == '') // All filter
				return true;
			
			// 'hurrdurr.txt' === '.txt' ?
			
			if (pFileName.indexOf(curFilter[0]) !== -1) return true;
		}
		else {
			var offset = 0;
			var found = true;
			
			for (var i = 0; i < curFilter.length; i++) {
				var text = curFilter[i];
				if (text === '') continue;
				// text = '.'
				var tmp = pFileName.indexOf(text, offset);
				if (tmp === -1) {
					found = false;
					break; // Continue with next filter
				}
				offset = tmp + 1;
			}
			
			if (found) return true;
		}
	}
	
	return false;
};

global.ForAllFiles = function (pFolder, pFilter, pCallback) {
	pFilter = pFilter || '*';
	if (typeof pFilter === 'string') {
		pFilter = pFilter.split(';');
	}
	for (var filter in pFilter) {
		var tmp = pFilter[filter].split('*'); // For things like '*.png' and 'hurr*.txt' (['hurr', '.txt'])
		
		var tmp2 = [];
		// Filter empty values
		for (var i = 0; i < tmp.length; i++)
			if (tmp[i] !== '') tmp2.push(tmp[i]);
		
		pFilter[filter] = tmp2;
	}
	
	require('fs').readdirSync(pFolder).forEach(function (pFileName) {
		// Check if filename is okay
		if (CheckFileFilter(pFileName, pFilter))
			pCallback(pFolder + '/' + pFileName);
	});
};