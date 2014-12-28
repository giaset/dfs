function getMoney(players) {
	var centers = []
	var left_wingers = []
	var right_wingers = []
	var defensemen = []
	var goalies = []

	for (player_id in players) {
		var player = players[player_id]

		var summary = { "id": player[2], "position": player[0], "name": player[1], "salary": parseInt(player[5]), "ppg": player[6], "games_played": parseInt(player[7])}

		if (summary.ppg > 0 && summary.games_played > 10) {
			switch(summary.position) {
				case 'C':
					centers.push(summary)
					break

				case 'LW':
					left_wingers.push(summary)
					break

				case 'RW':
					right_wingers.push(summary)
					break

				case 'D':
					defensemen.push(summary)
					break

				case 'G':
					goalies.push(summary)
					break

				default:
					break
			}
		}
	}

	// Sort in decreasing order of points/dollar
	function compare(a, b) {
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

	var players_per_position = 8

	centers.sort(compare)
	centers.length = players_per_position // truncate that shit

	left_wingers.sort(compare)
	left_wingers.length = players_per_position // truncate that shit

	right_wingers.sort(compare)
	right_wingers.length = players_per_position // truncate that shit

	defensemen.sort(compare)
	defensemen.length = players_per_position // truncate that shit

	goalies.sort(compare)
	goalies.length = players_per_position // truncate that shit

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
		for (lw_combo_index in lw_combinations) {
			var lw_combo = lw_combinations[lw_combo_index]
			var lw_points = lw_combo[0].ppg + lw_combo[1].ppg
			var lw_salaries = lw_combo[0].salary + lw_combo[1].salary
			for (rw_combo_index in rw_combinations) {
				var rw_combo = rw_combinations[rw_combo_index]
				var rw_points = rw_combo[0].ppg + rw_combo[1].ppg
				var rw_salaries = rw_combo[0].salary + rw_combo[1].salary
				for (def_combo_index in def_combinations) {
					var def_combo = def_combinations[def_combo_index]
					var def_points = def_combo[0].ppg + def_combo[1].ppg
					var def_salaries = def_combo[0].salary + def_combo[1].salary
					for (goalie_index in goalies) {
						var the_goalie = goalies[goalie_index]
						var total_salary = centers_salaries+lw_salaries+rw_salaries+def_salaries+the_goalie.salary
						if (total_salary <= 55000) {
							var total_points = centers_points+lw_points+rw_points+def_points+the_goalie.ppg
							var roster = {'total_salary': total_salary, 'total_points': total_points}
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

	rosters.sort(compare_total_points)

	console.log(rosters[0])

}
