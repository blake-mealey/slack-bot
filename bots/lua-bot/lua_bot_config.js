// Configuration file
module.exports = {
	defaults: {
		// Users with admin status
		user_admins: ["morgoth", "m0rgoth"],

		// Users with limited admin status
		user_limited_admins: [],

		// Users that are not allowed to use the bot
		user_blacklist: [],

		// Keywords that are not allowed in the lua code
		lua_blacklist: ["while", "repeat", "huge"],

		// Max length of the output
		max_length: 140
	}
}