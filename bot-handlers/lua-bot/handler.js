// Libraries
var nodelua = require('nodelua');

var lua;
function setupLuaInstance() {
	lua = new nodelua.LuaState('lua');
	//lua.registerFunction('print', pseudoprint);
	lua.setGlobal("OUTPUT", "");
	//lua.doStringSync("function print(...) for i, v in next, {...} do OUTPUT=OUTPUT..v end OUTPUT=OUTPUT..'\n' end");
	lua.doFileSync(__dirname + '/print.lua');
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

	if(formData.user_name == "slackbot") {
		return null;
	}

	var ret;
	if(formData.keyword == "lua") {
		var allowed = true;
		for (var i = 0; i < settings.lua_blacklist.length; i++) {
			if(formData.message.indexOf(settings.lua_blacklist[i]) > -1) {
				allowed = false;
				break;
			}
		};

		if(!allowed) {
			ret = "You used something that wasn't allowed!";
			continue;
		}

		try {
			lua.setGlobal("OUTPUT", "");
			try {
				lua.doStringSync(formData.message);
				ret = lua.getGlobal("OUTPUT");
			} catch(e) {
				ret = e.message;
			}
		} catch(e) {
			console.log(e);
		}
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