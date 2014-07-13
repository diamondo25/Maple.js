function getItemCategory(itemId) {
	return (itemId / 10000) >>> 0;
}

function getItemCategoryName(itemId) {
	switch (getItemCategory(itemId)) {
	
		case 101:
		case 102:
		case 103:
		case 112:
		case 113:
		case 114: return 'Accessory';

		case 100: return 'Cap';

		case 110: return 'Cape';

		case 104: return 'Coat';
		
		case 194:
		case 195:
		case 196:
		case 197: return 'Dragon';
		case 2: return 'Face';

		case 108: return 'Glove';
		
		case 3: return 'Hair';

		case 105: return 'Longcoat';
		
		case 106: return 'Pants';
		
		case 180:
		case 181:
		case 182:
		case 183: return 'PetEquip';

		case 111: return 'Ring';

		case 109: return 'Shield';
		
		case 107: return 'Shoes';
		
		case 190:
		case 191: // 192 is missing?
		case 193: return 'TamingMob';

		case 130:
		case 131:
		case 132:
		case 133:
		case 137:
		case 138:
		case 140:
		case 141:
		case 142:
		case 143:
		case 144:
		case 145:
		case 146:
		case 147:
		case 148:
		case 149:
		case 160:
		case 170: return 'Weapon';
		default: throw 'Unknown item category. Item: ' + itemId;
	}
}

function getCharacterNXNode(itemId) {
	var typeName = getItemCategoryName(itemId);
	
	return DataFiles.character.getPath(typeName + '/' + addLeftPadding(itemId, 8, '0') + '.img');
}


var ItemInfo = {};
ItemInfo.Cache = {};

ItemInfo.Cache.EquipItems = {};

ItemInfo.getEquipItem = function (itemId) {
	if (ItemInfo.Cache.EquipItems.hasOwnProperty(itemId)) return ItemInfo.Cache.EquipItems[itemId];
	
	var node = getCharacterNXNode(itemId);
	if (node === null) return null;
	
	var infoNode = node.child('info');

	var info = {};

	var stringNXNode = DataFiles.string.getPath('Eqp.img/Eqp/' + getItemCategoryName(itemId) + '/' + itemId);
	info.name = getOrDefault_NXData(stringNXNode.child('name'), '');
	info.description = getOrDefault_NXData(stringNXNode.child('desc'), '');
	
	// Unknowns

	info.ruc = getOrDefault_NXData(infoNode.child('tuc'), 0);
	info.fs = getOrDefault_NXData(infoNode.child('fs'), 1.0);
	
	// Others
	info.timeLimited = getOrDefault_NXData(infoNode.child('timeLimited'), 0);
	info.requiredStr = getOrDefault_NXData(infoNode.child('reqSTR'), 0);
	info.requiredDex = getOrDefault_NXData(infoNode.child('reqDEX'), 0);
	info.requiredInt = getOrDefault_NXData(infoNode.child('reqINT'), 0);
	info.requiredLuk = getOrDefault_NXData(infoNode.child('reqLUK'), 0);
	info.requiredFame = getOrDefault_NXData(infoNode.child('reqPOP'), 0);
	info.requiredJob = getOrDefault_NXData(infoNode.child('reqJob'), 0);
	info.requiredLevel = getOrDefault_NXData(infoNode.child('reqLev'), 0);
	info.requiredMobLevel = getOrDefault_NXData(infoNode.child('reqMobLevel'), 0);


	info.increaseStr = getOrDefault_NXData(infoNode.child('incSTR'), 0);
	info.increaseDex = getOrDefault_NXData(infoNode.child('incDEX'), 0);
	info.increaseInt = getOrDefault_NXData(infoNode.child('incINT'), 0);
	info.increaseLuk = getOrDefault_NXData(infoNode.child('incLUK'), 0);
	info.increaseMaxHP = getOrDefault_NXData(infoNode.child('incMHP'), 0);
	info.increaseMaxMP = getOrDefault_NXData(infoNode.child('incMMP'), 0);
	info.increaseWeaponAttack = getOrDefault_NXData(infoNode.child('incPAD'), 0);
	info.increaseWeaponDefence = getOrDefault_NXData(infoNode.child('incPDD'), 0);
	info.increaseMagicAttack = getOrDefault_NXData(infoNode.child('incMAD'), 0);
	info.increaseMagicDefence = getOrDefault_NXData(infoNode.child('incMDD'), 0);
	info.increaseAcc = getOrDefault_NXData(infoNode.child('incACC'), 0);
	info.increaseAvo = getOrDefault_NXData(infoNode.child('incEVO'), 0);
	info.increaseCrafting = getOrDefault_NXData(infoNode.child('incCraft'), 0);
	info.increaseSpeed = getOrDefault_NXData(infoNode.child('incSpeed'), 0);
	info.increaseJump = getOrDefault_NXData(infoNode.child('incJump'), 0);
	info.increaseSwim = getOrDefault_NXData(infoNode.child('incSwim'), 0);
	info.increaseFatigue = getOrDefault_NXData(infoNode.child('incFatigue'), 0);
	
	info.sellPrice = getOrDefault_NXData(infoNode.child('price'), 0);
	info.isCash = getOrDefault_NXData(infoNode.child('cash'), 0) !== 0;
	info.isQuest = getOrDefault_NXData(infoNode.child('quest'), 0) !== 0;
	info.isPartyQuest = getOrDefault_NXData(infoNode.child('pquest'), 0) !== 0;
	info.isOneInInventory = getOrDefault_NXData(infoNode.child('only'), 0) !== 0;
	info.isTradeBlocked = getOrDefault_NXData(infoNode.child('tradeBlock'), 0) !== 0;
	info.isUnsellable = getOrDefault_NXData(infoNode.child('notSale'), 0) !== 0;
	info.isExpiringOnLogout = getOrDefault_NXData(infoNode.child('expireOnLogout'), 0) !== 0;
	info.givesKnockback = getOrDefault_NXData(infoNode.child('knockback'), 0) !== 0;
	info.isBigSize = getOrDefault_NXData(infoNode.child('bigSize'), 0) !== 0;

	info.swim = getOrDefault_NXData(infoNode.child('swim'), 0);
	info.tamingMob = getOrDefault_NXData(infoNode.child('tamingMob'), 0);
	

	info.recovery = getOrDefault_NXData(infoNode.child('recovery'), 1.0);
	
	info.afterImageFlag = 0;
	
	if (((itemId / 100000) >>> 0) === 17) {
		// Cash item afterImage
		var weaponTypes = [30, 31, 32, 33, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47];
		var hasSetAFlag = false;
		for (var i = 0; i < weaponTypes.length; i++) {
			if (node.child(String(weaponTypes[i])) !== null) {
				info.afterImageFlag |= (1 << i);
				hasSetAFlag = true;
			}	
		}
		
		if (!hasSetAFlag) throw 'Weapon ' + equipId + ' does not have cash-weapon cover info.';
	}
	
	ItemInfo.Cache.EquipItems[itemId] = info;
	return info;
};

ItemInfo.Cache.BundleItems = {};

ItemInfo.getBundleItem = function (itemId) {
	if (ItemInfo.Cache.BundleItems.hasOwnProperty(itemId)) return ItemInfo.Cache.BundleItems[itemId];
	
	var node = getCharacterNXNode(itemId);
	if (node === null) return null;
	
	var infoNode = node.child('info');
	
	
	var info = {};
	// Others
	info.timeLimited = getOrDefault_NXData(infoNode.child('timeLimited'), 0);
	info.requiredLevel = getOrDefault_NXData(infoNode.child('reqLev'), 0);
	info.increaseWeaponAttack = getOrDefault_NXData(infoNode.child('incPAD'), 0);

	info.isTradeBlocked = getOrDefault_NXData(infoNode.child('tradeBlock'), 0) !== 0;
	info.isUnsellable = getOrDefault_NXData(infoNode.child('notSale'), 0) !== 0;
	info.isExpiringOnLogout = getOrDefault_NXData(infoNode.child('expireOnLogout'), 0) !== 0;
	info.sellPrice = getOrDefault_NXData(infoNode.child('price'), 0);
	info.sellPricePerUnit = getOrDefault_NXData(infoNode.child('unitPrice'), 0.0);
	info.isCash = getOrDefault_NXData(infoNode.child('cash'), 0) !== 0;
	info.isQuest = getOrDefault_NXData(infoNode.child('quest'), 0) !== 0;
	info.isPartyQuest = getOrDefault_NXData(infoNode.child('pquest'), 0) !== 0;
	info.isOneInInventory = getOrDefault_NXData(infoNode.child('only'), 0) !== 0;

	info.maxPerSlot = getOrDefault_NXData(infoNode.child('slotMax'), 0);
	info.mcType = getOrDefault_NXData(infoNode.child('mcType'), 0);

	ItemInfo.Cache.BundleItems[itemId] = info;
	
	return info;
};

function getItemNXNode(itemId) {
	var typeName = '';
	if (getItemCategory(itemId) === 500) {
		typeName = 'Pet';
	}
	else {
		switch ((itemId / 1000000) >>> 0) {
			case 2: typeName = 'Consume'; break;
			case 3: typeName = 'Install'; break;
			case 4: typeName = 'Etc'; break;
			case 5: typeName = 'Cash'; break;
			case 9: typeName = 'Special'; break;
			default: throw 'Unknown item type: ' + ((itemId / 1000000) >>> 0);
		}
	}
	var path = typeName + '/';
	if (typeName !== 'Pet') {
		path += '0' + ((itemId / 10000) >>> 0) + '.img/' + '0' + itemId;
	}
	else {
		path += itemId + '.img';
	}
	path += '/';

	console.log(path);
	return DataFiles.item.getPath(path);
}

ItemInfo.Cache.IncItem = {};

ItemInfo.getIncExpItem = ItemInfo.getIncDropItem = function (itemId) {
	if (ItemInfo.Cache.IncItem.hasOwnProperty(itemId)) return ItemInfo.Cache.IncItem[itemId];
	
	var category = getItemCategory(itemId);
	if (category !== 521 && category !== 536) return null;
	
	var node = getItemNXNode(itemId);
	if (node === null) return null;

	var infoNode = node.child('info');
	var info = {};
	
	info.rate = getOrDefault_NXData(infoNode.child('rate'), 0);
	info.time = [];
	
	var timeNode = infoNode.child('time');
	
	var days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'HOL'];
	
	var handleTimeNode = function (node) {
		if (node.getData().indexOf(dayName) === 0) {

			var result = /^([A-Z]{3}):([0-9]{2})-([0-9]{2})$/.exec(node.getData());
			if (!result || result[2] > 24 || result[3] > 24) return; //throw 'Invalid inc drop/exp item info. Timespan info was not correct: ' + element.getData() + '. ItemId: ' + itemId;
			
			if (days.indexOf(result[1]) == -1) return; //throw 'Invalid inc drop/exp item info. Unknown day: ' + result[1] + '. ItemId: ' + itemId;

			min = parseInt(result[2], 10);
			max = parseInt(result[3], 10);
			return false;
		}
	};
	
	for (var i = 0; i < 8; i++) {
		var dayName = days[i];
		var elements = new Array(24);
		var min = -1;
		var max = -1;
		
		timeNode.forEach(handleTimeNode);
		
		for (var j = 0; j < 24; j++) {
			elements[j] = j >= min && j < max;
		}
		
		info.time[i] = elements;
	}
	
	ItemInfo.Cache.IncItem[itemId] = info;
	return info;
};

global.ItemInfo = ItemInfo;