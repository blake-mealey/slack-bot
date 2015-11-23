// General bot config
var config = require('./bot_config');

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
for(var name in config.bots) {
	if(config.bots.hasOwnProperty(name)) {
		botHandlers[name] = require("./bot-handlers/" + name + "/handler.js");
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
			console.log("Of team: " + formData.team_domain);
			console.log("In channel: " + formData.channel_name);
			console.log("With keyword: " + formData.keyword);
			console.log("Saying: " + formData.message);

			var returnJSON;
			for(var name in config.bots) {
				if(!config.bots.hasOwnProperty(name)) { continue; }
				if(contains(config.bots[name].keywords, formData.keyword) &&
					contains(config.bots[name].api_tokens, formData.token)) {
					returnJSON = botHandlers[name](formData);
					break;
				}
			}

			if(returnJSON != null) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(returnJSON));
			}

			console.log("\n");
		});
	}
})

server.listen(config.server_port);
console.log('Slack bot running on localhost:'+config.server_port);