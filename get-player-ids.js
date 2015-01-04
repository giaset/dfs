var request = require('request')
var cheerio = require('cheerio')
var Firebase = require('firebase')

var fb = new Firebase('https://nhl.firebaseio.com/')
var teams = fb.child('teams')
var players = fb.child('players')

teams.once('value', function(snapshot) {
	console.log(snapshot.val())
	process.exit()
})
