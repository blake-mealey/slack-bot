// Libraries
var nodelua = require('nodelua');

var lua = new nodelua.LuaState('lua');

var output;
function pseudoprint() {
	var args = Array.prototype.slice.call(arguments);
	for(var i = 0; i < args.length; i++) {
		output += (args[i] + " ");
	};
	output += "\n"
}

//lua.registerFunction('print', pseudoprint);

function runLuaString(string) {
	output = "";
	lua.doStringSync(string);
	output = output.substr(0, output.length - 1);
	console.log(output);
}

//runLuaString("for i = 1, 10 do print(i, i*2, i^2, 2^i) end");

//runLuaString("s='{\\n' for i, v in next, getfenv() do s=s..'\\t\"'..tostring(i)..'\":'..tostring(v)..',\\n' end s=s..'}'")
//console.log(lua.getGlobal("s"));
//runLuaString("s=nil");

var gt = JSON.parse(lua.doFileSync(__dirname + "/encode_global_table.lua"));
lua.setGlobal("GLOBAL_TABLE_ENCODER", null);

console.log(gt);