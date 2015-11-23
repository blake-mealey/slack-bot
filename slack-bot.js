// General bot settings and info
var settings = require('./bot_settings');

// Node libraries
var http = require('http');
var qs = require('querystring');

function contains(a, obj) {
	var i = a.length;
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}

// Setup bot handlers
var botHandlers = {};
for(var name in settings.bots) {
	if(settings.bots.hasOwnProperty(name)) {
		botHandlers[name] = require("./bot-handlers/" + name + "_handler");
	}
}

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

			for(var name in settings.bots) {
				if(settings.bots.hasOwnProperty(name)) {
					if(contains(settings.bots[name].keywords, formData.keyword) &&
						contains(settings.bots[name].api_tokens, formData.token)) {
						botHandlers[name](formData, res);
					}
				}
			}

			console.log("\n");
		});
	}
})

server.listen(settings.server_port);
console.log('Slack bot running on localhost:'+settings.server_port);