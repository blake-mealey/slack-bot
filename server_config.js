// Configuration file
module.exports = {
	// Bot setup
	bots: {
		// Math bot
		"math": {
			keywords: ["math"],
			api_tokens: ["MeOMOCQVJuNVmy5ncAXawuHc", "DVnsiBDARYberjjyIOBoq6ez"]
		},

		// Echo bot
		"echo": {
			keywords: ["echo"],
			api_tokens: ["orP5nPZ5VhVmWXAsZp8UFsGq", "Az0nkJFDDTGoOwI4tvlBGh7W"]
		},

		// Lua bot
		"lua": {
			keywords: ["lua", "luaadmin"],
			api_tokens: ["oaO0zwUM72SO4l2FkisKZChY", "ReShF6M0O7iEKGVYLK7hCGZC"]
		}
	},

	// Port to listen to on the server
	server_port: 8080
}
