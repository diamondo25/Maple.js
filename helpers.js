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

global.GetOrDefault = function (pValue, pDefault) {
	if (pValue === null || typeof pValue === 'undefined') return pDefault;
	return pValue;
};

global.GetOrDefault_NXData = function (pNode, pDefault) {
	if (pNode === null || typeof pNode === 'undefined') return pDefault;
	var data = pNode.GetData();
	if (data instanceof Int64) return data.low32();
	return data;
};

global.AddLeftPadding = function (pValue, pLength, pPaddingCharacter) {
	pPaddingCharacter = pPaddingCharacter || '0';
	pValue = pValue.toString();
	for (var i = pValue.length; i < pLength; i++)
		pValue = pPaddingCharacter + pValue;
	return pValue;
};

global.AddRightPadding = function (pValue, pLength, pPaddingCharacter) {
	pPaddingCharacter = pPaddingCharacter || '0';
	pValue = pValue.toString();
	for (var i = pValue.length; i < pLength; i++)
		pValue += pPaddingCharacter;
	return pValue;
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
			pCallback(pFolder + '/' + pFileName, pFileName);
	});
};

global.FindRows = function (pModel, pColumnName, pExpectedValue) {
	var searchObject = {};
	searchObject[pColumnName] = pExpectedValue;
	return wait.forMethod(pModel, 'find', searchObject);
};

global.GetDocumentId = function (pDocument) {
    return parseInt('0x' + String(pDocument._id).substr(0, 8));
};

global.FindDocumentByCutoffId = function (pModel, pDocumentId, pFilterAdditions) {
	var filter = pFilterAdditions || {};
	pDocumentId = pDocumentId.toString(16);
	
	var query = pModel.find();
	for (var index in filter) {
		query = query.where(index).equals(filter[index]);
	}
	query = query.select('_id');
	
	var rows = wait.forMethod(query, 'exec');
	
	for (var i = 0; i < rows.length; i++) {
		if (rows[i]._id.toString().indexOf(pDocumentId) == 0) {
			return wait.forMethod(pModel, 'findById', rows[i]._id);
		}
	}
	
	return null;
};

global.GetInventoryOfItemId = function (pItemId) {
    return (pItemId / 10000000) >>> 0;
};


global.IsInsideBox = function (pWhatX, pWhatY, pInX, pInY, pMaxDistance) {
	return ((pInX - pMaxDistance) <= pWhatX && (pInX + pMaxDistance) >= pWhatX) && ((pInY - pMaxDistance) <= pWhatY && (pInY + pMaxDistance) >= pWhatY);
};

global.IsInsideRadius = function (pWhatX, pWhatY, pInX, pInY, pMaxRadius) {
	return Distance(pWhatX, pWhatY, pInX, pInY) <= pMaxRadius;
};

global.Distance = function (pX1, pY1, pX2, pY2) {
	return Math.sqrt(Math.pow(pX1 - pX2, 2) + Math.pow(pY1 - pY2, 2));
};