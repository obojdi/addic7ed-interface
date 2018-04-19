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
		$select_episodes;


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
			select_seasons.load(function(callback) {
				xhr && xhr.abort();
				xhr = $.ajax({
					url: proxy + 'http://www.addic7ed.com/ajax_getSeasons.php',
					data: {
						showID: value,
					},
					success: function(results) {
						select_seasons.enable();
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
			select_episodes.load(function(callback) {
				xhr && xhr.abort();
				xhr = $.ajax({
					url: proxy + 'http://www.addic7ed.com/ajax_getEpisodes.php?showID=94&&season=2',
					data: {
						//	pass select_shows value
						showID: select_shows.getValue(),
						season: value
					},
					success: function(results) {
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

			xhr && xhr.abort();
			xhr = $.ajax({
				url: proxy + 'http://www.addic7ed.com/serie/Eureka/2/1/1',
				data: {
					//	pass select_shows value
					// showID: select_shows.getValue(),
					// season: value
				},
				success: function(results) {
					$table = $('table.subs');
					$table.html('')
					console.log(results)
					res__ = $(results);
					$(results).find('#container95m table .tabel95').each(function(i, el) {
						var
							$tr = $('<tr/>'),
							version = $(el).find('td.NewsTitle').text(),
							$version = $('<td/>').text(version),
							lang = $(el).find('td.language').text(),
							$lang = $('<td/>').text(lang),
							link = $(el).find('a.buttonDownload').attr('href'),
							$link = $('<td/>').text(link);
						$version.appendTo($tr)
						$lang.appendTo($tr)
						$link.appendTo($tr)
						$tr.appendTo($table);
						console.log($tr)
						// return true;

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

});