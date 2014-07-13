var MapObjectPool = function MapObjectPool() {
	this._elements = [];
	this._nextIndex = 0;
};

MapObjectPool.prototype.push = function (element) {
	element._mapObjectId = this._nextIndex++;
	this._elements.push(element);
};

MapObjectPool.prototype.pop = function (element) {
	element._mapObjectId = -1;
	this._elements.pop(element);
};

MapObjectPool.prototype.find = function (index) {
	for (var i = 0; i < this._elements.length; i++) {
		var element = this._elements[i];
		if (element._mapObjectId === index) {
			return element;
		}
	}
	
	return null;
};

MapObjectPool.prototype.forEach = function (fn, scope) {
	for (var i = 0; i < this._elements.length; i++) {
		var element = this._elements[i];
		fn.call(scope || this, element, i, this._elements);
	}
};

MapObjectPool.prototype.getAmount = function () {
	return this._elements.length;
};

var LifePool = function LifePool(map, mapData) {
	this.map = map;
	this.mobs = new MapObjectPool();
	this.npcs = new MapObjectPool();
	this.employees = new MapObjectPool();
	
	this.lastMobSpawn = new Date();
	
	
	var mobSpawnInfo = [];
	
	(mapData.child('life') || [] ).forEach(function (lifeElement) {
		var type = lifeElement.child('type').getData();
		if (type != 'm') return;
		
		var info = {
			id: getOrDefault_NXData(lifeElement.child('id'), 9999999),
			fh: getOrDefault_NXData(lifeElement.child('fh'), -1),
			x: getOrDefault_NXData(lifeElement.child('x'), 0),
			y: getOrDefault_NXData(lifeElement.child('cy'), 0),
			mcTeam: getOrDefault_NXData(lifeElement.child('team'), -1),
			respawnInterval: getOrDefault_NXData(lifeElement.child('mobTime'), 0) * 1000,
			mobCount: 0,
			respawnTime: 0
		};
		
		// Calculate next spawn time
		
		if (info.respawnInterval > 0) {
			var min = (info.respawnInterval / 10) >>> 0;
			var max = 6 * min;
			if (max > 0) {
				info.respawnTime = min + RandomizerInstance.random() % max;
			}
			else {
				info.respawnTime = RandomizerInstance.random();
			}
		}
		
		mobSpawnInfo.push(info);
	});
	
	this.mobSpawnInfo = mobSpawnInfo;
	this.mobSpawnCount = mobSpawnInfo.length;
	
	this.minMobCapacity = 1000;
	this.maxMobCapacity = 2000;
	
	this.TrySpawnMobs(true);
};

LifePool.prototype.TrySpawnMobs = function (force) {
	if (this.mobSpawnCount === 0) return; // No mobs to spawn
	var currentTime = new Date().getTime();
	// if ((currentTime - this.lastMobSpawn) < 7000) return;
	
	var currentCapacity = this.mobs.getAmount();
	
	var minCapacity = this.minMobCapacity;
	var maxMobsToSpawn = minCapacity;
	if (currentCapacity > minCapacity / 2) {
		maxMobsToSpawn = currentCapacity < (2 * minCapacity) ? (minCapacity + (this.maxMobCapacity - minCapacity) * (2 * currentCapacity - minCapacity) / (3 * minCapacity)) : minCapacity;
	}
	
	// Index current spawned mobs
	var currentPositions = [];
	this.mobs.forEach(function (mob) {
		if (mob.templateId === 9999999) return;
		currentPositions.push([mob.movableLife.x, mob.movableLife.y]);
	});
	
	// Try spawn some mobs
	
	var map = this;
	var mobsToSpawn = [];
	
	this.mobSpawnInfo.forEach(function (spawnableMob) {
		if (!force && (spawnableMob.respawnInterval === 0 || spawnableMob.mobCount !== 0 || (currentTime - spawnableMob.respawnTime) < 0)) return;
		
		var hasAMob = false;
		for (var i = 0; i < currentPositions.length; i++) {
			var pos = currentPositions[i];
			if (isInsideBox(spawnableMob.x, spawnableMob.y, pos[0], pos[1], 100)) {
				hasAMob = true;
				console.log('found mob on same pos');
				break;
			}
		}
		if (!hasAMob)
			mobsToSpawn.push(spawnableMob);
	});

	console.log('Max mobs to spawn: ' + maxMobsToSpawn);
	for (var i = 0; i < maxMobsToSpawn && i < mobsToSpawn.length; i++) {
		var mob = mobsToSpawn[i];
		console.log('Spawning ' + mob.id + ' at ' + mob.x + ';' + mob.y);
		
		
	}
	
	this.lastMobSpawn = new Date();
};

global.LifePool = LifePool;