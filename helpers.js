global.Int64 = require('int64-native');

global.getFiletimeFromDate = function (pDate) {
	if (!(pDate instanceof Date)) return null;
	var rawTime = pDate.getTime();
	rawTime += 11644473600000; // Seconds between 1601-01-01 00:00:00 and 1970-01-01 00:00:00
	rawTime *= 10000; // Convert to nanoseconds
	return new Int64(rawTime);
};

global.getWorldInfoById = function (id) {
	for (var name in ServerConfig.worlds) {
		if (ServerConfig.worlds[name].id == id)
			return ServerConfig.worlds[name];
	}
	return null;
};

global.getJobTrack = function (job) {
	return parseInt(job / 100, 10);
};

global.ipStringToBytes = function (ip) {
	var ipParts = ip.split('.');
	return [parseInt(ipParts[0], 10), parseInt(ipParts[1], 10), parseInt(ipParts[2], 10), parseInt(ipParts[3], 10)];
};

global.getOrDefault = function (value, defaultValue) {
	if (value === null || typeof value === 'undefined') return defaultValue;
	return value;
};

global.getOrDefault_NXData = function (node, defaultValue) {
	if (node === null || typeof node === 'undefined') return defaultValue;
	var data = node.getData();
	if (data instanceof Int64) return data.low32();
	return data;
};

global.addLeftPadding = function (value, length, paddingCharacter) {
	paddingCharacter = paddingCharacter || '0';
	value = value.toString();
	for (var i = value.length; i < length; i++)
		value = paddingCharacter + value;
	return value;
};

global.addRightPadding = function (value, length, paddingCharacter) {
	paddingCharacter = paddingCharacter || '0';
	value = value.toString();
	for (var i = value.length; i < length; i++)
		value += paddingCharacter;
	return value;
};

global.checkFileFilter = function (fileName, filters) {
	for (var filter in filters) {
		var curFilter = filters[filter];
		var okay = false;
		if (curFilter.length == 1) {
			if (curFilter[0] === '') // All filter
				return true;
			
			// 'hurrdurr.txt' === '.txt' ?
			
			if (fileName.indexOf(curFilter[0]) !== -1) return true;
		}
		else {
			var offset = 0;
			var found = true;
			
			for (var i = 0; i < curFilter.length; i++) {
				var text = curFilter[i];
				if (text === '') continue;
				// text = '.'
				var tmp = fileName.indexOf(text, offset);
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

global.forAllFiles = function (folder, filter, callback) {
	var filters = filter || '*';
	filters = filters.split(';');
	
	for (var filter in filters) {
		var tmp = filters[filter].split('*'); // For things like '*.png' and 'hurr*.txt' (['hurr', '.txt'])
		
		var tmp2 = [];
		// Filter empty values
		for (var i = 0; i < tmp.length; i++)
			if (tmp[i] !== '') tmp2.push(tmp[i]);
		
		filters[filter] = tmp2;
	}
	
	require('fs').readdirSync(folder).forEach(function (fileName) {
		// Check if filename is okay
		if (checkFileFilter(fileName, filters))
			callback(folder + '/' + fileName, fileName);
	});
};

global.findRows = function (model, columnName, expectedValue) {
	var searchObject = {};
	searchObject[columnName] = expectedValue;
	return wait.forMethod(model, 'find', searchObject);
};

global.getDocumentId = function (document) {
    return parseInt(String(document._id).substr(0, 8), 16);
};

global.findDocumentByCutoffId = function (model, documentId, filterAdditions) {
	var filter = filterAdditions || {};
	documentId = documentId.toString(16);
	
	var query = model.find();
	for (var index in filter) {
		query = query.where(index).equals(filter[index]);
	}
	query = query.select('_id');
	
	var rows = wait.forMethod(query, 'exec');
	
	for (var i = 0; i < rows.length; i++) {
		if (rows[i]._id.toString().indexOf(documentId) === 0) {
			return wait.forMethod(model, 'findById', rows[i]._id);
		}
	}
	
	return null;
};

global.getInventoryOfItemId = function (itemId) {
    return (itemId / 10000000) >>> 0;
};


global.isInsideBox = function (whatX, whatY, inX, inY, maxDistance) {
	return ((inX - maxDistance) <= whatX && (inX + maxDistance) >= whatX) && ((inY - maxDistance) <= whatY && (inY + maxDistance) >= whatY);
};

global.isInsideRadius = function (whatX, whatY, inX, inY, maxRadius) {
	return distance(whatX, whatY, inX, inY) <= maxRadius;
};

global.distance = function (x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};