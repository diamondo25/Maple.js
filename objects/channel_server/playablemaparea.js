var PlayableMapArea = function PlayableMapArea(mapData) {
	
	var footholds = {};
	var bounds = {
		left: 2147483647,
		top: 2147483647,
		right: -2147483648,
		bottom: -2147483648
	};
	
	// Load footholds
	(mapData.child('foothold') || [] ).forEach(function (groupNode) {
		var group = {};
		
		groupNode.forEach(function (footholdNode) {
			var foothold = {};
			footholdNode.forEach(function (elementNode) {
				var fh = {
					x1: getOrDefault_NXData(elementNode.child('x1'), 0),
					y1: getOrDefault_NXData(elementNode.child('y1'), 0),
					x2: getOrDefault_NXData(elementNode.child('x2'), 0),
					y2: getOrDefault_NXData(elementNode.child('y2'), 0),

					force: getOrDefault_NXData(elementNode.child('force'), 0),

					next: getOrDefault_NXData(elementNode.child('next'), 0),
					prev: getOrDefault_NXData(elementNode.child('prev'), 0),
				};
				
				foothold[elementNode.getName()] = fh;
				
				var maxX = fh.x1 > fh.x2 ? fh.x1 : fh.x2;
				var minX = fh.x1 < fh.x2 ? fh.x1 : fh.x2;
				var maxY = fh.y1 > fh.y2 ? fh.y1 : fh.y2;
				var minY = fh.y1 < fh.y2 ? fh.y1 : fh.y2;

				if (bounds.left > maxX + 30) bounds.left = maxX + 30;
				if (bounds.right < minX - 30) bounds.right = minX - 30;
				if (bounds.top > maxY + 300) bounds.top = maxY + 300;
				if (bounds.bottom < minY - 300) bounds.bottom = minY - 300;
			});
			
			group[footholdNode.getName()] = foothold;
		});
		footholds[groupNode.getName()] = group;
	});
	
	
	this.footholds = footholds;
	
	this.bounds = bounds;
	this.bounds.left += 10;
	this.bounds.right += 10;
	this.bounds.top += 10;
	this.bounds.bottom += 10;
	
	// Load ladders and ropes

	var ladderRopes = {};
	(mapData.child('ladderRope') || [] ).forEach(function (ladderRopeNode) {
		var ladderRope = {
			x: getOrDefault_NXData(ladderRopeNode.child('x'), 0),
			y1: getOrDefault_NXData(ladderRopeNode.child('y1'), 0),
			y2: getOrDefault_NXData(ladderRopeNode.child('y2'), 0),
			

			isLadder: getOrDefault_NXData(ladderRopeNode.child('l'), 0) !== 0,
			page: getOrDefault_NXData(ladderRopeNode.child('page'), 0),
			upperFoothold: getOrDefault_NXData(ladderRopeNode.child('uf'), 0) !== 0,
		};
		
		ladderRopes[ladderRopeNode.getName()] = ladderRope;
	});
	
	this.ladderRopes = ladderRopes;
};





global.PlayableMapArea = PlayableMapArea;