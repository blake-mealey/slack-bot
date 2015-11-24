GLOBAL_TABLE_ENCODER = {}

GLOBAL_TABLE_ENCODER.blacklist = {"string", "package", "os", "setmetatable", "io", "getmetatable", "math", "debug", "table", "coroutine", "_G", "xpcall", "tostring", "print", "unpack",
	"require", "getfenv", "next", "assert", "tonumber", "rawequal", "collectgarbage", "module", "rawset", "pcall", "newproxy", "type", "select", "gcinfo", "pairs", "rawget",
	"loadstring", "ipairs", "_VERSION", "dofile", "setfenv", "load", "error", "loadfile", "GLOBAL_TABLE_ENCODER"}

a = "hello, world"
b = {1, 2, 3}
c = {a = 1, b = 2, c = 3}
d = 10
e = false
f = nil
g = function()
end

function GLOBAL_TABLE_ENCODER.contains(t, e)
	for i, v in next, t do
		if v == e then
			return true
		end
	end
	return false
end

function GLOBAL_TABLE_ENCODER.getTabs(depth)
	local s = ""
	for i = 1, depth do
		s = s.."\t"
	end
	return s
end

function GLOBAL_TABLE_ENCODER.encodeTable(table, depth)
	local tabsn = GLOBAL_TABLE_ENCODER.getTabs(depth - 1)
	local s = tabsn..'{\n'
	local tabs = GLOBAL_TABLE_ENCODER.getTabs(depth)
	local didEncodedVaraible = false
	for k, v in next, table do
		if not GLOBAL_TABLE_ENCODER.contains(GLOBAL_TABLE_ENCODER.blacklist, k) then
			local encodedV = ""
			local typeOfV = type(v)
			if typeOfV == "table" then
				encodedV = GLOBAL_TABLE_ENCODER.encodeTable(v, depth + 1)
			elseif typeOfV == "number" or typeOfV == "boolean" then
				encodedV = tostring(v)
			else
				encodedV = '"'..tostring(v)..'"'
			end
			s = s..tabs..'"'..tostring(k)..'\": '..encodedV..',\n'
			didEncodedVaraible = true
		end
	end
	if didEncodedVaraible then
		s = s:sub(1, #s - 2)..'\n'
	end
	s = s..tabsn..'}'
	return s
end

return GLOBAL_TABLE_ENCODER.encodeTable(getfenv(), 1)