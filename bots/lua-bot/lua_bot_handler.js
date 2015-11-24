// Bot config
var config = require('./lua_bot_config');

// Node libraries
var nodelua = require('nodelua');
var fs = require('fs');

// Print method that overrides the default Lua print method
var output;
function pseudoprint() {
	var args = Array.prototype.slice.call(arguments);
	for(var i = 0; i < args.length; i++) {
		output += (args[i] + " ");
	};
	output += "\n"
}

// Table containing all currently running instances
var luaInstances = {};

// Starts a Lua instance
function setupLuaInstance(name) {
	luaInstances[name] = new nodelua.LuaState(name);
	luaInstances[name].registerFunction('print', pseudoprint);
}

// Captures the output after running some Lua code
function runAndCaptureOutput(name, string) {
	try {
		output = "";
		luaInstances[name].doStringSync(string);
		if(output.length > config.max_length) {
			output = output.substr(0, config.max_length);
		}
		return output;
	} catch(e) {
		return e.message;
	}
}

// Saves the global table of a Lua instance to a file
function saveGlobalTable(name) {
	var gt = luaInstances[name].doFileSync(__dirname + "/encode_global_table.lua");
	luaInstances[name].setGlobal("GLOBAL_TABLE_ENCODER", null);

	var str = "module.exports = " + gt;

	fs.writeFile(__dirname + "/global-tables/" + name + "_global_table.js", str, function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("Lua bot global table file saved.");
	}); 
}

// Saves the config object to the config file
function saveConfig() {
	var str = "module.exports = " + JSON.stringify(config);

	fs.writeFile(__dirname + "/lua_bot_config.js", str, function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("Lua bot config file saved.");
	}); 
}

// Simple table contains element method
function contains(a, obj) {
	var i = a.length;
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}

// Simple append to array method
function appendToArray(array, element) {
	if(!contains(array, element)) {
		array.push(element);
		return true;
	}
	return false;
}

// Simple remove from array method
function removeFromArray(array, element) {
	var index = array.indexOf(element);
	if(index > -1) {
		array.splice(index, 1);
		return true;
	}
	return false;
}

// Handler function
module.exports = function(formData) {
	console.log("Lua bot handling request.");

	if(formData.user_name == "slackbot") {
		return null;
	}

	if(luaInstances[formData.team_domain] == null) {
		setupLuaInstance(formData.team_domain);
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
			ret = runAndCaptureOutput(formData.team_domain, formData.message);
		} else {
			ret = "You aren't allowed to use '" + illegalword + "'' in your code!";
		}
	} else if(formData.keyword == "luaadmin") {
		var firstSpace = formData.message.indexOf(" ")
		var firstWord = formData.message.substr(0, firstSpace);
		var secondWord;
		if(formData.message.length > firstSpace + firstWord.length) {
			var secondWord = formData.message.substr(firstSpace + 1);
		}

		if(contains(config.user_admins, formData.user_name) || contains(config.user_limited_admins, formData.user_name)) {
			if(firstWord == "reset") {
				setupLuaInstance(formData.team_domain);
				ret = "Lua instance reset."
			} else if(firstWord == "setlength") {
				config.max_length = Number(secondWord);
				saveConfig();
				ret = "Max length of output set to: " + config.max_length;
			} else if(firstWord == "list") {
				var listName = secondWord == "admins" ? "user_admins" : secondWord == "limitedadmins" ? "user_limited_admins" : secondWord == "banned" ?
					"user_blacklist" : secondWord == "blacklist" ? "lua_blacklist" : null;
				if(listName != null) {
					ret = "";
					for (var i = 0; i < config[listName].length; i++) {
						ret += config[listName][i] + i < config[listName].length ? ", " : "";
					};
				}
			} else if(firstWord == "getlength") {
				console.log('hi');
				ret = config.max_length.toString();
			}
		} 
		if(contains(config.user_admins, formData.user_name)) {
			if(firstWord == "ban") {
				if(appendToArray(config.user_blacklist, secondWord)) {
					ret = secondWord + " was added to ban list."
					saveConfig();
				} else {
					ret = secondWord + " is already on the ban list."
				}
			} else if(firstWord == "unban") {
				if(removeFromArray(config.user_blacklist, secondWord)) {
					ret = secondWord + " was removed from the ban list."
					saveConfig();
				} else {
					ret = secondWord + " is not on the ban list."
				}
			} else if(firstWord == "promote") {
				if(appendToArray(config.user_limited_admins, secondWord)) {
					ret = secondWord + " was promoted to a limited admin."
					saveConfig();
				} else {
					ret = secondWord + " is already a limited admin."
				}
			} else if(firstWord == "demote") {
				if(removeFromArray(config.user_limited_admins, secondWord)) {
					ret = secondWord + " was demoted from a limited admin."
					saveConfig();
				} else {
					ret = secondWord + " wasn't a limited admin to start with."
				}
			} else if(firstWord == "blacklist") {
				if(appendToArray(config.lua_blacklist, secondWord)) {
					ret = secondWord + " was added to the blacklist."
					saveConfig();
				} else {
					ret = secondWord + " is already on the blacklist."
				}
			} else if(firstWord == "whitelist") {
				if(removeFromArray(config.lua_blacklist, secondWord)) {
					ret = secondWord + " was removed from the blacklist."
					saveConfig();
				} else {
					ret = secondWord + " is already on the whitelist."
				}
			}
		}
	}

	return {
		text: ret
	}
}