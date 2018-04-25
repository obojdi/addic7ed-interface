// ideas used:
// https://github.com/Inrego/addic2subs/blob/master/SubsDownloader/Websites/Addic7ed/Plugin.cs
// npm ad7
// npm adddic7ed-api

var
	express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	// logger = require('morgan'),
	bodyParser = require('body-parser'),
	stylus = require('stylus'),
	request = require('request'),
	cheerio = require('cheerio'),
	moment = require('moment'),
	// 

	index = require('./routes/index'),
	users = require('./routes/users'),
	routes = require('./routes/routes'),
	texts = require('./app/js/data'),
	// 
	// 
	app = express();

const urls = {
	sample: 'http://www.addic7ed.com/serie/Eureka/2/1/1',
	ajaxShows: 'http://www.addic7ed.com/ajax_getShows.php',
	ajaxSeasons: 'http://www.addic7ed.com/ajax_getSeasons.php?showID=94',
	ajaxEpisodes: 'http://www.addic7ed.com/ajax_getEpisodes.php?showID=94&&season=2',
	ajaxFull: 'http://www.addic7ed.com/ajax_loadShow.php?show=94&season=2'
}

if (typeof localStorage === "undefined" || localStorage === null) {
	var LocalStorage = require('node-localstorage').LocalStorage;
	localStorage = new LocalStorage('./localStorage');
}

/*
parse({url: url}, (data) => {
  console.log(data);
}, (err) => {
  console.log(err);
});
*/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "pug");


// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
// extended: false
// }));
app.use(favicon(path.join(__dirname, 'favicon.ico')));

app.use(
	stylus.middleware({
		src: __dirname + '/src',
		dest: __dirname + '/app',
		// force: true,
		// debug: true,
		compile: function(str, path, fn) {
			return stylus(str)
				.set('filename', path)
				.set('compress', true)
		}
	})
)
// app.use(express.static(path.join(__dirname, 'app')));

app.use('/app', express.static(__dirname + '/app'));

app.get('/favicon.ico', function(req, res) {
	res.status(204);
});

// app.use('/', index);
// app.use('/users', users);
var addic7edApi = require('addic7ed-api');
addic7edApi.search('Eureka', 2, 1).then(function(subtitlesList) {
	var subInfo = subtitlesList[0];
	if (subInfo) {
		// console.log('addic7edApi.search:')
		// console.log(subInfo)
		// addic7edApi.download(subInfo, './South.Park.S19E06.srt').then(function() {
		// console.log('Subtitles file saved.');
		// });
	}
});
/**
/* if no route specified then load all shows
/* else try to parse url and check result for showID
/*             responseText = responseText.replace(/<img/gi, '<noload');
/* (<(\b(img|style|script|head|link)\b)(([^>]*\/>)|([^\7]*(<\/\2[^>]*>)))|(<\bimg\b)[^>]*>|(\b(background|style)\b=\s*"[^"]*"))

*/
app.get('/', function(req, res) {
	var params = {
		title: 'Hey',
		message: 'Hello there!'
	};
	res.render('index', params);
	next();
});
app.get('/:show/:season?/:episode?/:language?', function(req, res, next) {
	var
		headers = {
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
		},
		params = req.params || {},
		requestData = {},
		options = {
			headers: headers
		};

	console.log(' ');
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
					$ = cheerio.load(body, {
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


	if (params.show) {
		// call season list
		requestData.shows = JSON.parse(localStorage.getItem('shows')).items || [];

		requestData.title = requestData.shows.slice().filter((s) => s.id == params.show).pop().name || 'title not loaded'
	}
	if (params.season) {
		// TODO: add GET params to request
		// show param is already set
		// call episode list
		options.url = urls.ajaxSeasons;
		// console.log('season: ' + params.season)
		request(options, function(error, response, body) {
			if (!error) {
				var
					$ = cheerio.load(body, {
						normalizeWhitespace: true
					}),
					serverDown = $.text().match('mysql_pconnect') ? true : false,
					title;
				console.log("season request sent");
				if (serverDown) {
					requestData.title = 'addic7ed server down'
					// console.log($.html())
				} else {

					requestData.seasons = $('#qsiSeason option').map(function(i, el) {
						return {
							id: parseInt($(el).val()),
							name: $(el).text()
						}
					}).get();
				}

			} else {
				console.log("Error: " + error);
			}
		});
	}
	if (params.episode) {
		// show and season params are already set
		// call subtitle file list, all languages
		options.url = urls.ajaxEpisodes;
		// console.log('episode: ' + params.episode)
		request(options, function(error, response, body) {
			if (!error) {
				var
					$ = cheerio.load(body, {
						normalizeWhitespace: true
					}),
					serverDown = $.text().match('mysql_pconnect') ? true : false,
					title;
				console.log("episode request sent");
				if (serverDown) {
					requestData.title = 'addic7ed server down'
					// console.log($.html())
				} else {
					requestData.episodes = $('#qsiEp option').map(function(i, el) {
						return {
							id: parseInt($(el).val()),
							name: $(el).text()
						}
					}).get();
				}
				requestData.episode_subtitles = $('#container95m table .tabel95').map((i, el) => {
					return {
						version: $(el).find('td.NewsTitle').text(),
						lang: $(el).find('td.language').text(),
						link: $(el).find('a.buttonDownload').attr('href')
					};

				});


			} else {
				console.log("Error: " + error);
			}
		});
	}
	if (params.language) {
		// TODO:
		// show, season and episode params are already set
		// call subtitle file list, selected language
		// console.log('language: ' + params.language)
	}
	requestData.params = params;
	res.render('eureka', requestData);


});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', {
		message: res.locals.message,
		error: JSON.stringify(res.locals.error)
	});
});

module.exports = app;