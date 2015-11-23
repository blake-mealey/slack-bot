// Handler function
module.exports = function(formData) {
	console.log("Echo bot handling request.");

	if(formData.user_name != "slackbot") {
		return {
			text: formData.message
		}
	} else {
		console.log("No infinte loops allowed!");
		return null;
	}
}