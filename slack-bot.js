// General bot settings and info
var settings = require('./bot_settings');

// Node libraries
var http = require('http');
var qs = require('querystring');

// Bot handlers
var mathBotHandler = require('./math_bot_handler');
var echoBotHandler = require('./echo_bot_handler');

var server = http.createServer(function(req, res) {
	if(req.method == "POST") {
		var reqBody = '';
		req.on('data', function(data) {
			reqBody += data;
		});
		req.on('end', function() {
			var formData = qs.parse(reqBody);

			var firstSpace = formData.text.indexOf(" ")
			formData.keyword = formData.text.substr(0, firstSpace);
			formData.message = formData.text.substr(firstSpace + 1);

			console.log("Handling request:")
			console.log("From user: " + formData.user_name);
			console.log("In channel: " + formData.channel_name);
			console.log("With keyword: " + formData.keyword);
			console.log("Saying: " + formData.message);

			if(formData.token == settings.math_bot_api_token) {
				mathBotHandler(formData, res);
			} else if(formData.token == settings.echo_bot_api_token) {
				echoBotHandler(formData, res);
			}

			console.log("\n");
		});
 	}
})

server.listen(settings.server_port);
console.log('Slack bot running on localhost:'+settings.server_port);