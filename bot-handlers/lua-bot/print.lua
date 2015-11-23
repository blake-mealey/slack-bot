function print( ... )
	local args = {...}
	for i = 1, #args do
		OUTPUT = OUTPUT..args[i]
	end
	OUTPUT = OUTPUT.."\n"
end