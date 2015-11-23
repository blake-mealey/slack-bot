// General bot config
var config = require('./config');

// Libraries
var nodelua = require('nodelua');
var fs = require('fs');

var lua;
function setupLuaInstance() {
	lua = new nodelua.LuaState('lua');
	//lua.registerFunction('print', pseudoprint);
	lua.setGlobal("OUTPUT", "");
	//lua.doStringSync("function print(...) for i, v in next, {...} do OUTPUT=OUTPUT..v end OUTPUT=OUTPUT..'\n' end");
	lua.doFileSync(__dirname + '/print.lua');
}

function saveConfig() {
	var str = "module.exports = " + JSON.stringify(config);
	fs.writeFile(__dirname + "/config.js", str, function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("Lua bot config file saved.");
	}); 
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
module.exports = function(formData) {
	console.log("Lua bot handling request.");

	if(formData.user_name == "slackbot") {
		return null;
	}

	var ret;
	if(formData.keyword == "lua" && !contains(config.user_blacklist, formData.user_name)) {
		var allowed = true;
		var illegalword = "";
		for (var i = 0; i < config.lua_blacklist.length; i++) {
			if(formData.message.indexOf(config.lua_blacklist[i]) > -1) {
				allowed = false;
				illegalword = config.lua_blacklist[i];
				break;
			}
		};

		if(allowed) {
			try {
				lua.setGlobal("OUTPUT", "");
				try {
					lua.doStringSync(formData.message);
					ret = lua.getGlobal("OUTPUT");
					if(ret.length > config.max_length) {
						ret = ret.substr(0, config.max_length - 1);
					}
				} catch(e) {
					ret = e.message;
				}
			} catch(e) {
				console.log(e);
			}
		} else {
			ret = "You aren't allowed to use '" + illegalword + "'' in your code!";
		}
	} else if(formData.keyword == "luaadmin") {
		var firstSpace = formData.message.indexOf(" ")
		var firstWord = formData.message.substr(0, firstSpace);
		var secondWord = formData.message.substr(firstSpace + 1);

		if(contains(config.user_admins, formData.user_name) || contains(config.user_limited_admins, formData.user_name)) {
			if(firstWord == "reset") {
				setupLuaInstance();
				ret = "Lua instance reset."
			} else if(firstWord == "setlength") {
				config.max_length = Number(secondWord);
				saveConfig();
			}
		} else if(contains(config.user_admins, formData.user_name)) {
			if(firstWord == "ban") {
				if(!contains(config.user_blacklist, secondWord)) {
					config.user_blacklist.push(secondWord);
					saveConfig();
				}
			} else if(firstWord == "unban") {
				var index = config.user_blacklist.indexOf(secondWord);
				if(index > -1) {
					config.user_blacklist.splice(index, 1);
					saveConfig();
				}
			} else if(firstWord == "promote") {
				if(!contains(config.user_limited_admins, secondWord)) {
					config.user_limited_admins.push(secondWord);
					saveConfig();
				}
			} else if(firstWord == "demote") {
				var index = config.user_limited_admins.indexOf(secondWord);
				if(index > -1) {
					config.user_limited_admins.splice(index, 1);
					saveConfig();
				}
			} else if(firstWord == "blacklist") {
				if(!contains(config.lua_blacklist, secondWord)) {
					config.lua_blacklist.push(secondWord);
					saveConfig();
				}
			} else if(firstWord == "whitelist") {
				var index = config.lua_blacklist.indexOf(secondWord);
				if(index > -1) {
					config.lua_blacklist.splice(index, 1);
					saveConfig();
				}
			}
		}
	}

	return {
		text: ret
	}
}