// Bot configuration file
module.exports = {
	// Bot setup
	bots: {
		// Math bot
		math-bot: {
			keywords: ["math"],
			api_tokens: ["MeOMOCQVJuNVmy5ncAXawuHc", "DVnsiBDARYberjjyIOBoq6ez"]
		},

		// Echo bot
		echo-bot: {
			keywords: ["echo"],
			api_tokens: ["orP5nPZ5VhVmWXAsZp8UFsGq", "Az0nkJFDDTGoOwI4tvlBGh7W"]
		},

		// Lua bot
		lua-bot: {
			keywords: ["lua", "luaadmin"],
			api_tokens: ["oaO0zwUM72SO4l2FkisKZChY"],
			settings: {
				admins: ["morgoth", "m0rgoth"]
			}
		}
	},

	// Port to listen to on the server
	server_port: 8080
}