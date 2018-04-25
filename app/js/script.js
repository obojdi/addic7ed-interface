var
	res__,
	xhr,
	select_shows,
	select_seasons,
	select_episodes;
proxy = 'https://cors-anywhere.herokuapp.com/';
$(document).ready(() => {
	var
		$select_shows,
		$select_seasons,
		$select_episodes,
		$table = $('table.subs'),
		$spinner = $('.sk-wave');


	/**
	/* shows list is loaded server side
	/* default lang is en for now
	/* .shows change triggers ajax to populate seasons select
	/* .seasons change triggers ajax to populate episodes select
	/* .episodes select change triggers ajax to populate download list
	*/

	$select_shows = $('.shows').selectize({
		placeholder: 'select a show',
		valueField: 'id',
		labelField: 'name',
		searchField: 'name',
		onChange: function(value) {
			if (!value.length) return;
			//	clear seasons
			select_seasons.disable();
			select_seasons.clearOptions();
			//	clear episodes
			select_episodes.disable();
			select_episodes.clearOptions();
			//	clear results
			$table.html('');
			$spinner.removeClass('hidden');
			select_seasons.load(function(callback) {
				xhr && xhr.abort();
				xhr = $.ajax({
					url: proxy + 'http://www.addic7ed.com/ajax_getSeasons.php',
					data: {
						showID: value,
					},
					success: function(results) {
			$spinner.addClass('hidden');
						select_seasons.enable();
						var selector = $(results).find('option').get().map(function(el, i) {
							var obj = {
								id: $(el).val(),
								name: $(el).text()
							}
							return obj;
						});
						$('h1').text($(".shows option:selected").text());
						callback(selector);
					},
					error: function() {
						callback();
					}
				})
			});
		}
	});
	$select_seasons = $('.seasons').selectize({
		placeholder: 'select a season',
		valueField: 'id',
		labelField: 'name',
		searchField: 'name',
		onChange: function(value) {
			if (!value.length) return;
			//	clear episodes
			select_episodes.disable();
			select_episodes.clearOptions();
			//	clear results
			$table.html('');
			$spinner.removeClass('hidden');
			select_episodes.load(function(callback) {
				xhr && xhr.abort();
				xhr = $.ajax({
					url: proxy + 'http://www.addic7ed.com/ajax_getEpisodes.php',
					data: {
						//	pass select_shows value
						showID: select_shows.getValue(),
						season: value
					},
					success: function(results) {
			$spinner.addClass('hidden');
						select_episodes.enable();
						var selector = $(results).find('option').get().map(function(el, i) {
							var obj = {
								id: $(el).val(),
								name: $(el).text()
							}
							return obj;
						});
						callback(selector);
					},
					error: function() {
						callback();
					}
				})
			});
		}
	});
	$select_episodes = $('.episodes').selectize({
		placeholder: 'select an episode',
		valueField: 'id',
		labelField: 'name',
		searchField: 'name',
		onChange: function(value) {
			if (!value.length) return;
			//	clear results
			$table.html('');
			$spinner.removeClass('hidden');
			var parts = [];
			parts.push($(".shows option:selected").text().replace(/\s/, '_'))
			// parts.push(select_shows.getValue());
			parts.push(select_seasons.getValue());
			parts.push(select_episodes.getValue().split('x')[1]);
			// English subs
			parts.push(1);
			var suffix = parts.join('/');
			var url = proxy + 'http://www.addic7ed.com/ajax_loadShow.php'
			console.log(url)
			xhr && xhr.abort();
			xhr = $.ajax({
				url: url,
				data: {
					//	pass select_shows value
					show: select_shows.getValue(),
					season: select_seasons.getValue()
					// episode: value
				},
				success: function(results) {
			$spinner.addClass('hidden');
					var
					 $rows = $(results).find('#season tr.epeven').filter((b, a) => parseInt($(a).find('td').eq(1).text()) == value);
					$rows.sort((a, b) => {
						var
							versionA = $(a).find('td.c').eq(0).text(),
							versionB = $(b).find('td.c').eq(0).text(),
							langA = $(a).find('td').eq(3).text(),
							langB = $(b).find('td').eq(3).text();

						var _lang = langA.localeCompare(langB);
						var _version = versionA.localeCompare(versionB);
						return _lang || _version;
					});
					$rows.each(function(i, el) {
						var
							// version: $(el).find('td.c').eq(0).text(),
							// ext: $(el).find('td').eq(2).find('a').attr('href'),
							// link: $(el).find('td.c').eq(-1).find('a').attr('href'),
							// lang: $(el).find('td').eq(3).text(),
							// checkbox: $(el).find('input').html()
							$tr = $('<tr/>'),
							version = $(el).find('td.c').eq(0).text(),
							$version = $('<td/>'),
							base = 'http://www.addic7ed.com',
							link = $(el).find('td.c').eq(-1).find('a').attr('href'),
							$link = $('<a/>').attr('href', base + link).attr('target', '_blank').text(version),
							lang = $(el).find('td').eq(3).text();
						$link.appendTo($version);
						$lang = $('<td/>').text(lang);
						$version.appendTo($tr)
						$lang.appendTo($tr)
						$tr.appendTo($table);
					});
				},
				error: function() {
					callback();
				}
			})
		}
	});


	select_shows = $select_shows[0].selectize;
	select_seasons = $select_seasons[0].selectize;
	select_episodes = $select_episodes[0].selectize;

	// local storage
	localStorage.setItem('peqwa', JSON.stringify({
		a: 'test'
	}));

});