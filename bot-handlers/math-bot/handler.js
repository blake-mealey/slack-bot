// Constants declarations
var MATH_IMAGE_URL = "http://www.forkosh.com/mimetex.cgi?"

// Libraries
var parseMath = require('./libs/ASCIIMath2TeX');

// Handler function
module.exports = function(formData) {
	console.log("Math bot handling request.");

	return {
		text: formData.user_name + ":",
		attachments: [
			{
				"text": "MATH",
				"image_url": MATH_IMAGE_URL + parseMath(formData.message)
			}
		]
	}
}