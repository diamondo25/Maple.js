
var temp = require('crypto').getCiphers();
for (var i = 0; i < temp.length; i++) {
	try {
		var cr = crypto.createCipheriv(temp[i], aesKey, '');
		
		var tmp = new Buffer([
			1,2,3,4,
			1,2,3,4,
			1,2,3,4,
			1,2,3,4
		]);
		tmp = cr.update(tmp);
		var tmp2 = '';
		for (var j = 0; j < 16; j++)
			tmp2 += tmp[j] + ' ';
		console.log(tmp2);
		console.log('Testing crypto ' + temp[i]);
	}
	catch (ex) { }
}