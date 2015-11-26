// Node libraries
var request = require('sync-request');

function getPassage(lookup) {
	return request('GET', 'http://labs.bible.org/api/?type=text&formatting=plain&passage=' + lookup).body.toString('utf-8');
}

// Handler function
module.exports = function(formData) {
	console.log("Bible bot handling request.");

	return {
		text: getPassage(formData.message)
	}
}