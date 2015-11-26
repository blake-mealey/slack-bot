// Node libraries
var request = require('sync-request');

function getPassage(lookup) {
	var jsonString = request('GET', 'http://labs.bible.org/api/?type=json&passage=' + lookup).body.toString('utf-8')
	return JSON.parse(jsonString);
}

function book(title) {
	return "\n*" + title + "*"
}

function chapter(chapter) {
	return "\n_Chapter " + chapter + "_\n";
}

function verse(verse) {
	return " *" + verse + "* "
}

// Handler function
module.exports = function(formData) {
	console.log("Bible bot handling request.");

	var passages = getPassage(formData.message)

	var formatted = "";

	var last;
	for (var i = 0; i < passages.length; i++) {
		var passage = passages[i];

		if(!last) {
			formatted += book(passage.bookname);
			formatted += chapter(passage.chapter);
			formatted += verse(passage.verse);
		} else {
			if(last.bookname != passage.bookname) {
				formatted += "\n" + book(passage.bookname);
			}
			if(last.chapter != passage.chapter) {
				formatted += chapter(passage.chapter);
			}
			formatted += verse(passage.verse);
		}

		formatted += passage.text;

		last = passage;
	};

	return {
		text: formatted
	}
}

/*[{"bookname":"John",
"chapter":"3",
"verse":"16",
"text":"For this is the way God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life."}]*/