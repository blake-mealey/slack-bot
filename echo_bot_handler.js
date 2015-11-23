// Handler function
module.exports = function(formData, res) {
	console.log("Echo bot handling request.");

	if(formData.user_name != "slackbot") {
		res.writeHead(200, {'Content-Type': 'application/json'});
		var json = JSON.stringify({
			text: formData.message;
		});
		res.end(json);
	} else {
		console.log("No infinte loops allowed!");
	}
}