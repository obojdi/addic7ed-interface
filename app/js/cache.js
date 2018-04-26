const urls = {
		sample: 'http://www.addic7ed.com/serie/Eureka/2/1/1',
		ajaxShows: 'http://www.addic7ed.com/ajax_getShows.php',
		ajaxSeasons: 'http://www.addic7ed.com/ajax_getSeasons.php',
		ajaxEpisodes: 'http://www.addic7ed.com/ajax_getEpisodes.php',
		ajaxFull: 'http://www.addic7ed.com/ajax_loadShow.php'
	},

	headers = {
		'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
	};
if (typeof localStorage === "undefined" || localStorage === null) {
	var LocalStorage = require('node-localstorage').LocalStorage;
	localStorage = new LocalStorage('./localStorage');
}
var
	moment = require('moment'),
	request = require('request'),
	cheerio = require('cheerio');


let check = () => {
	// check if local storage item exists
	if (typeof localStorage.getItem('shows') !== 'string') {
		// no shows item in LS, set LS shows and cache var anew
		var cache = {
			shows: {
				// !
				timestamp: moment().subtract(7, 'days').format(),
				// items: {}
				items: []
				// items: [{id:null,name:null}]
			}
		};
		localStorage.setItem('shows', JSON.stringify(cache.shows));
	} else {
		// LS shows exist, pull shows from LS to cache var
		var cache = {
			shows: {
				timestamp: moment(JSON.parse(localStorage.getItem('shows')).timestamp).format(),
				items: JSON.parse(localStorage.getItem('shows')).items
			}
		};
	}
	// cache shows 
	if (moment().subtract(1, 'minutes').isAfter(cache.shows.timestamp)) {
		// timestamp exceeded, sending request
		var opts = {
			url: urls.ajaxShows,
			headers: headers
		};
		let request_shows = request(opts, (err, resp, body) => {
			if (!err) {
				// parse request results
				var
					html = body.replace(/<img\b[^>]*>/ig, ''),
					$ = cheerio.load(html, {

						normalizeWhitespace: true
					}),
					serverDown = $.text().match('mysql_pconnect') ? true : false,
					title;
				if (serverDown) {
					// throw error
					var err_text = 'addic7ed server down'
				} else {
					// TODO: call .get() on cheerio collection, not after mapping
					var items = $('#qsShow option').map(function(i, el) {
						return {
							id: parseInt($(el).val()),
							name: $(el).text()
						}
					}).get();
				}
				// store new shows data in local storage/redis
				localStorage.setItem('shows', JSON.stringify({
					timestamp: moment(),
					//	put request parse results to items
					items: items
				}));
				console.log("Sent request to update shows cache");
			} else {
				console.log("Error: " + error);
			}
		})
	} else {
		// timestamp not exceeded, keep cache
		console.log("pulled shows from cache");
	}
}
module.exports = check();