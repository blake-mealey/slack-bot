// Libraries
var nodelua = require('nodelua');

var output;
function print() {
	var args = Array.prototype.slice.call(arguments, print.length);
	var output = "";
	for (var i = 0; i < args.length; i++) {
		output += args[i];
	};
}

var lua;
function setupLuaInstance() {
	lua = new nodelua.LuaState('lua');
	lua.registerFunction('print', print);
}

setupLuaInstance();

function contains(a, obj) {
	var i = a.length;
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}

// Handler function
module.exports = function(formData, settings) {
	console.log("Lua bot handling request.");

	var ret;
	if(formData.keyword == "lua") {
		lua.doString(formData.message, function(error, retValue) {
			if(!error && retValue) {
				ret = output;
			} else {
				ret = error;
			}
		});
	} else if(formData.keyword == "luaadmin" &&
		contains(settings.admins, formData.user_name)) {
		if(formData.message == "reset") {
			setupLuaInstance();
			ret = "Lua instance reset."
		}
	}

	return {
		text: ret
	}
}