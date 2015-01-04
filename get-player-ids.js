var request = require('request')
var cheerio = require('cheerio')
var Firebase = require('firebase')

var fb = new Firebase('https://nhl.firebaseio.com/')
var teams = fb.child('teams')
var players = fb.child('players')

teams.once('value', function(snapshot) {
	var teamsObject = snapshot.val()
	for (team in teamsObject) {
		//console.log(team)

		//http://www.nhl.com/ice/playersearch.htm?team=BUF#
		var url = 'http://www.nhl.com/ice/playersearch.htm?team='+team+'#'
		request(url, function(error, reponse, html) {
			if (!error) {
				var $ = cheerio.load(html)
				$('table.data tr').each(function(index, row) {
					var player = {}

					$('td', this).each(function(index, cell) {
						var cellValue = $(this).text()
						switch(index) {
							case 0:
							var withoutNewLines = cellValue.substr(1, cellValue.length-2)
							// MacKinnon, Nathan (C)
							var commaSplit = withoutNewLines.split(',')
							player.last_name = commaSplit[0]
							//  Nathan (C) *note the space*
							var secondPart = commaSplit[1].substr(1)
							var parenthesesSplit = secondPart.split('(')
							player.first_name = parenthesesSplit[0].substr(0, parenthesesSplit[0].length-1)
							break

							case 1:
							player.team = cellValue.substr(0, cellValue.length-1)
							break
						}
					})

					if (!isEmpty(player)) {
						console.log(player)
					}
				})
			} else {
				console.log(error)
			}
		})

	}
	//process.exit()
})

function isEmpty(obj) {
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			return false
		}
	}

	return true
}
