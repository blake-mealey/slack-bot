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

// Starts a Lua instance
function setupLuaInstance(name) {
	luaInstances[name] = new nodelua.LuaState(name);
	luaInstances[name].registerFunction('print', pseudoprint);
	if(config[name] == null) {
		config[name] = JSON.parse(JSON.stringify(config.defaults));
		saveConfig();
	}
}

// Captures the output after running some Lua code
function runAndCaptureOutput(name, string) {
	try {
		output = "";
		luaInstances[name].doStringSync(string);
		if(output.length > config[name].max_length) {
			output = output.substr(0, config[name].max_length);
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

function addToList(list, commands, successString, failureString) {
	var ret = "";
	for (var i = 1; i < commands.length; i++) {
		if(appendToArray(list, commands[i])) {
			ret += commands[i] + " " + successString;
		} else {
			ret += commands[i] + " " + failureString;
		}
		if(i < commands.length - 2) {
			ret += "\n";
		}
	};
	saveConfig();
	return ret;
}

function removeFromList(list, commands, successString, failureString) {
	var ret = "";
	for (var i = 1; i < commands.length; i++) {
		if(removeFromArray(list, commands[i])) {
			ret += commands[i] + " " + successString;
		} else {
			ret += commands[i] + " " + failureString;
		}
		if(i < commands.length - 2) {
			ret += "\n";
		}
	};
	saveConfig();
	return ret;
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

	var thisconfig = config[formData.team_domain];

	var ret;
	if(formData.keyword == "lua" && !contains(thisconfig.user_blacklist, formData.user_name)) {
		var illegalword;
		for (var i = 0; i < thisconfig.lua_blacklist.length; i++) {
			if(new RegExp("\\b" + thisconfig.lua_blacklist[i] + "\\b").test(formData.message)) {
				illegalword = thisconfig.lua_blacklist[i];
				break;
			}
		};

		if(illegalword == null) {
			ret = runAndCaptureOutput(formData.team_domain, formData.message);
		} else {
			ret = "You aren't allowed to use '" + illegalword + "' in your code!";
		}
	} else if(formData.keyword == "luaadmin") {
		var commands = formData.message.split(' ');

		var isAdmin = contains(thisconfig.user_admins, formData.user_name);
		var isLimitedAdmin = contains(thisconfig.user_limited_admins, formData.user_name);

		if(isAdmin || isLimitedAdmin) {
			if(commands[0] == "reset") {
				setupLuaInstance(formData.team_domain);
				ret = "Lua instance reset."
			} else if(commands[0] == "setlength") {
				thisconfig.max_length = Number(commands[1]);
				saveConfig();
				ret = "Max length of output set to: " + thisconfig.max_length;
			} else if(commands[0] == "list") {
				var listName = commands[1] == "admins" ? "user_admins" : commands[1] == "limitedadmins" ? "user_limited_admins" : commands[1] == "banned" ?
					"user_blacklist" : commands[1] == "blacklist" ? "lua_blacklist" : null;
				if(listName != null) {
					ret = "";
					for (var i = 0; i < thisconfig[listName].length; i++) {
						ret += thisconfig[listName][i] + (i < thisconfig[listName].length - 1 ? ", " : "");
					};
				}
			} else if(commands[0] == "getlength") {
				console.log('hi');
				ret = thisconfig.max_length.toString();
			}

			if(isAdmin) {
				if(commands[0] == "ban") {
					ret = addToList(thisconfig.user_blacklist, commands, "was added to ban list.", "is already on the ban list.");
				} else if(commands[0] == "unban") {
					ret = removeFromList(thisconfig.user_blacklist, commands, "was removed from ban list.", "is not on the ban list.");
				} else if(commands[0] == "promote") {
					ret = addToList(thisconfig.user_limited_admins, commands, "was promoted to a limited admin.", "is already a limited admin.");
				} else if(commands[0] == "demote") {
					ret = removeFromList(thisconfig.user_limited_admins, commands, "was demoted from a limited admin.", "wasn't a limited admin to start with.");
				} else if(commands[0] == "blacklist") {
					ret = addToList(thisconfig.lua_blacklist, commands, "was added to the blacklist.", "is already on the blacklist.");
				} else if(commands[0] == "whitelist") {
					ret = removeFromList(thisconfig.lua_blacklist, commands, "was removed from the blacklist.", "is already on the whitelist.");
				}
			}
		}

		if(ret == null) {
			ret = "You do not have the privileges to do this.";
		}
	}

	return {
		text: ret
	}
}