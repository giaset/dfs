var request = require('request')
var cheerio = require('cheerio')

var SortBy = {"PointsPerDollar": 0, "Points": 1, "Salary": 2, "ProjectedPoints": 3, "ProjectedPointsPerDollar": 4}

request('http://www.rotowire.com/daily/nhl/value-report.htm', function(error, response, html) {
		if (!error) {
			var $ = cheerio.load(html)

			var players = []
			
			$('tr', 'tbody').each(function(i, elem) {
				var player = {'name': '', 'position': '', 'salary': '', 'projected': '', 'projected_value': '', 'ppg': ''}

				player.name = $(this).find('a').text()

				$('td', this).each(function(i, elem) {
					switch (i) {
						case 1:
						player.position = $(this).text()
						break

						case 4:
						// Salaries are like $9,000, so remove the dollar sign and comma
						player.salary = parseInt($(this).text().substring(1).replace(/,/g, ''))
						break

						case 5:
						player.projected = parseFloat($(this).text())
						break

						case 6:
						player.projected_value = parseFloat($(this).text())
						break

						case 7:
						player.ppg = parseFloat($(this).text())
						if (isNaN(player.ppg)) {
							player.ppg = 0
						}
						break
					}
				})

				var excluded = []
				process.argv.forEach(function(val, index, array) {
					if (index >= 2) {
						excluded.push(val)
					}
				})

				var isExcluded = false
				for (excluded_index in excluded) {
					var excluded_name = excluded[excluded_index]
					if (excluded_name == player.name) {
						isExcluded = true
						console.log(player.name + ' is excluded')
						break
					}
				}

				if (player.projected > 0 && !isExcluded) {
					players.push(player)
				}
			})

			/* CHANGE 'SORTBY' AS YOU PLEASE */
			getMoney(players, SortBy.ProjectedPoints)
		} else {
			console.log(error)
		}
	})

function getMoney(players, sortby, rotowire_players) {
	var centers = []
	var left_wingers = []
	var right_wingers = []
	var defensemen = []
	var goalies = []

	for (player_id in players) {
		var player = players[player_id]

		switch(player.position) {
			case 'C':
				centers.push(player)
				break

			case 'LW':
				left_wingers.push(player)
				break

			case 'RW':
				right_wingers.push(player)
				break

			case 'D':
				defensemen.push(player)
				break

			case 'G':
				goalies.push(player)
				break

			default:
				break
		}
	}

	function compare_points_per_dollar(a, b) {
		var a_ratio = a.ppg/a.salary
		var b_ratio = b.ppg/b.salary
		if (a_ratio == b_ratio) {
			return 0;
		} else if (a_ratio > b_ratio) {
			return -1;
		} else if (a_ratio < b_ratio) {
			return 1;
		}
	}

	function compare_points(a, b) {
		if (a.ppg == b.ppg) {
			return 0;
		} else if (a.ppg > b.ppg) {
			return -1;
		} else if (a.ppg < b.ppg) {
			return 1;
		}
	}

	function compare_projected_points(a, b) {
		if (a.projected == b.projected) {
			return 0;
		} else if (a.projected > b.projected) {
			return -1;
		} else if (a.projected < b.projected) {
			return 1;
		}
	}

	function compare_projected_value(a, b) {
		if (a.projected_value == b.projected_value) {
			return 0;
		} else if (a.projected_value > b.projected_value) {
			return -1;
		} else if (a.projected_value < b.projected_value) {
			return 1;
		}
	}

	/* SOMETIMES 9 WORKS, SOMETIMES IT DOESN'T */
	var players_per_position = 10

	if (sortby == SortBy.PointsPerDollar) {
		console.log('Sorting top ' + players_per_position + ' players by avg. points per dollar.')
		centers.sort(compare_points_per_dollar)
		left_wingers.sort(compare_points_per_dollar)
		right_wingers.sort(compare_points_per_dollar)
		defensemen.sort(compare_points_per_dollar)
		goalies.sort(compare_points_per_dollar)
	} else if (sortby == SortBy.Points) {
		console.log('Sorting top ' + players_per_position + ' players by avg. points.')
		centers.sort(compare_points)
		left_wingers.sort(compare_points)
		right_wingers.sort(compare_points)
		defensemen.sort(compare_points)
		goalies.sort(compare_points)
	} else if (sortby == SortBy.ProjectedPoints) {
		console.log('Sorting top ' + players_per_position + ' players by projected points.')
		centers.sort(compare_projected_points)
		left_wingers.sort(compare_projected_points)
		right_wingers.sort(compare_projected_points)
		defensemen.sort(compare_projected_points)
		goalies.sort(compare_projected_points)
	} else if (sortby == SortBy.ProjectedPointsPerDollar) {
		console.log('Sorting top ' + players_per_position + ' players by projected points per dollar.')
		centers.sort(compare_projected_value)
		left_wingers.sort(compare_projected_value)
		right_wingers.sort(compare_projected_value)
		defensemen.sort(compare_projected_value)
		goalies.sort(compare_projected_value)
	}

	centers.length = players_per_position
	left_wingers.length = players_per_position
	right_wingers.length = players_per_position
	defensemen.length = players_per_position
	goalies.length = players_per_position

	function k_combinations(set, k) {
		var i, j, combs, head, tailcombs;
		
		if (k > set.length || k <= 0) {
			return [];
		}
		
		if (k == set.length) {
			return [set];
		}
		
		if (k == 1) {
			combs = [];
			for (i = 0; i < set.length; i++) {
				combs.push([set[i]]);
			}
			return combs;
		}
		
		// Assert {1 < k < set.length}
		
		combs = [];
		for (i = 0; i < set.length - k + 1; i++) {
			head = set.slice(i, i+1);
			tailcombs = k_combinations(set.slice(i + 1), k - 1);
			for (j = 0; j < tailcombs.length; j++) {
				combs.push(head.concat(tailcombs[j]));
			}
		}
		return combs;
	}

	var center_combinations = k_combinations(centers, 2)
	var lw_combinations = k_combinations(left_wingers, 2)
	var rw_combinations = k_combinations(right_wingers, 2)
	var def_combinations = k_combinations(defensemen, 2)

	var rosters = []
	for (c_combo_index in center_combinations) {
		var c_combo = center_combinations[c_combo_index]
		var centers_points = c_combo[0].ppg + c_combo[1].ppg
		var centers_salaries = c_combo[0].salary + c_combo[1].salary
		var centers_projected = c_combo[0].projected + c_combo[1].projected
		for (lw_combo_index in lw_combinations) {
			var lw_combo = lw_combinations[lw_combo_index]
			var lw_points = lw_combo[0].ppg + lw_combo[1].ppg
			var lw_salaries = lw_combo[0].salary + lw_combo[1].salary
			var lw_projected = lw_combo[0].projected + lw_combo[1].projected
			for (rw_combo_index in rw_combinations) {
				var rw_combo = rw_combinations[rw_combo_index]
				var rw_points = rw_combo[0].ppg + rw_combo[1].ppg
				var rw_salaries = rw_combo[0].salary + rw_combo[1].salary
				var rw_projected = rw_combo[0].projected + rw_combo[1].projected
				for (def_combo_index in def_combinations) {
					var def_combo = def_combinations[def_combo_index]
					var def_points = def_combo[0].ppg + def_combo[1].ppg
					var def_salaries = def_combo[0].salary + def_combo[1].salary
					var def_projected = def_combo[0].projected + def_combo[1].projected
					for (goalie_index in goalies) {
						var the_goalie = goalies[goalie_index]
						var total_salary = centers_salaries+lw_salaries+rw_salaries+def_salaries+the_goalie.salary
						if (total_salary <= 55000) {
							var total_points = centers_points+lw_points+rw_points+def_points+the_goalie.ppg
							var total_projected = centers_projected+lw_projected+rw_projected+def_projected+the_goalie.projected
							var roster = {'total_salary': total_salary, 'total_points': total_points, 'total_projected': total_projected}
							roster['c'] = c_combo
							roster['lw'] = lw_combo
							roster['rw'] = rw_combo
							roster['def'] = def_combo
							roster['g'] = the_goalie
							rosters.push(roster)
						}
					}
				}
			}
		}
	}

	console.log(rosters.length + ' rosters generated')

	// Sort in decreasing order of points
	function compare_total_points(a, b) {
		if (a.total_points == b.total_points) {
			return 0;
		} else if (a.total_points > b.total_points) {
			return -1;
		} else if (a.total_points < b.total_points) {
			return 1;
		}
	}

	function compare_total_projected(a, b) {
		if (a.total_projected == b.total_projected) {
			return 0;
		} else if (a.total_projected > b.total_projected) {
			return -1;
		} else if (a.total_projected < b.total_projected) {
			return 1;
		}
	}

	rosters.sort(compare_total_points)
	console.log('Best roster sorted by avg. points:')
	console.log(rosters[0])

	rosters.sort(compare_total_projected)
	console.log('Best roster sorted by projected points:')
	console.log(rosters[0])
}
