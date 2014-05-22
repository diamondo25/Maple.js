Maple.js
========

MapleStory Server core using Node.js

Installing
========
Make sure you got a MongoDB server running, and you've installed Node.js.
Git clone (or download the zip) this repository into a directory.

Edit `config.json` to your needs. Note the `publicIP` values; this IP is sent to the client on selecting character/changing channel!
Run the following command to install the required modules:
```
npm install
```
Then, run the server using the following command:
```
node maplejs
```

The server should be ready to use now.


Coding Conventions
========
* Use pVariableName for function parameters
* Use CamelCase for function names and objects (which are also functions?!)
* Use camelCase for variables
* Tabs with 4 length for indenting
* Brackets not on newline
* Single-quotes (') for strings (except in JSON, this does not support single-quotes)
* Semicolons after variable declarations, even anonymous functions that are assigned to a variable.

For example:

```javascript
exports.SetHandler = function (pOpCode, pCallback) {
	if (pOpCode in handlers) {
		var previousHandler = handlers[pOpCode];
		pCallback = function (pSession, pReader) {
			previousHandler(pSession, pReader);
			pReader.offset = 0;
			pCallback(pSession, pReader);
		};
	}
	
	handlers[pOpCode] = pCallback;
	console.log('Registered callback for ' + pOpCode.toString(16) + '!');
};
```
