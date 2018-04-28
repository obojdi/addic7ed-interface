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
	Q = require("q"),
	cookieParser = require('cookie-parser'),
	fs = require('fs'),


	// 

	index = require('./routes/index'),
	users = require('./routes/users'),
	routes = require('./routes/routes'),
	texts = require('./app/js/data'),
	// test = require('./routes/test'),
	// 
	// 
	app = express();
require('dotenv').config();

const urls = {
	sample: 'http://www.addic7ed.com/serie/Eureka/2/1/1',
	ajaxShows: 'http://www.addic7ed.com/ajax_getShows.php',
	ajaxSeasons: 'http://www.addic7ed.com/ajax_getSeasons.php',
	ajaxEpisodes: 'http://www.addic7ed.com/ajax_getEpisodes.php',
	ajaxFull: 'http://www.addic7ed.com/ajax_loadShow.php'
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

// cookie parser
app.use(cookieParser());

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

// var request = request.defaults({
// jar: true
// })
var
	j = request.jar(),
	j2 = request.jar()
url_login = 'http://www.addic7ed.com/dologin.php',
	url_download = 'http://www.addic7ed.com/updated/17/1824/4'

app.get('/test', (req, resp) => {
	// console.log('Cookies 1: ', req.cookies)
	var
		filename = '',
		dir = '/test/';
	request.post(url_login, {
		form: {
			username: process.env.USERNAME,
			password: process.env.PASSWORD
		},
		jar: j
	}, function(err, res, body) {
		var
			cookie_string = j.getCookieString(url_login),
			cookies = j.getCookies(url_login),
			cookie1 = request.cookie(cookie_string);

		// console.log('cookie_string: ', cookie_string)
		// console.log('cookies: ', cookies)
		j.setCookie(cookie1, url_login);

		// console.log('Cookies 2: ', res.cookies)
		request.get(url_download, {
			jar: j
		}, (e, r, b) => {
			var
				cookie_string2 = j2.getCookieString(url_download),
				cookies2 = j2.getCookies(url_download);
			// console.log('cookie_string 2: ', cookie_string2)
			// console.log('cookies 2: ', cookies2)
			// console.log('Cookies 3: ', r.cookies)
			// console.log(r.headers)

			// console.log('body: ', b)
			var
				contentDisposition = r.headers['content-disposition'],
				match = contentDisposition && contentDisposition.match(/(filename=|filename\*='')(.*)$/);
			filename = match && match[2] || 'default-filename.out';
			console.log('filename')
			filename = filename.replace(/\s/g, '');
			filename = filename.replace(/\"/g, '');
			// dir = __dirname + '/test/txt/';
			// filename = 'a.txt';

			// filename = dir + filename;
			console.log(filename)
			console.log(path.join(__dirname, dir, filename))
			console.log(path.parse(path.join(__dirname, dir, filename)))
			// resp.setHeader(  'content-type', 'text/srt; charset=');
			resp.setHeader('content-disposition', contentDisposition);
			// resp.setHeader('content-disposition', 'attachment');

			request.get('http://www.addic7ed.com/logout.php', () => {

				resp.end(b)
			});
		})
		// .pipe(fs.createWriteStream(path.join(__dirname, dir, filename)))
		// .pipe(fs.createWriteStream(path.join('./test/', 'a.srt')))
		// .pipe(fs.createWriteStream(path.join('./test/',filename)))
		// .pipe(fs.createWriteStream(path.join( dir, filename)))
		// .pipe(fs.createWriteStream(__dirname+'/test/Eureka-02x03-Unpredictable.WS.DSR.XviD-SYS.Dutch.updated.Addic7ed.com.srt'))

	})
});
// app.use('/', index);
// app.use('/users', users);
// var addic7edApi = require('addic7ed-api');
// addic7edApi.search('Eureka', 2, 1).then(function(subtitlesList) {
// var subInfo = subtitlesList[0];
// if (subInfo) {
// console.log('addic7edApi.search:')
// console.log(subInfo)
// addic7edApi.download(subInfo, './South.Park.S19E06.srt').then(function() {
// console.log('Subtitles file saved.');
// });
// }
// });
/**
/* if no route specified then load all shows
/* else try to parse url and check result for showID
/*             responseText = responseText.replace(/<img/gi, '<noload');
/* (<(\b(img|style|script|head|link)\b)(([^>]*\/>)|([^\7]*(<\/\2[^>]*>)))|(<\bimg\b)[^>]*>|(\b(background|style)\b=\s*"[^"]*"))

*/
// app.get('/', function(req, res) {
// var params = {
// title: 'Hey',
// message: 'Hello there!'
// };
// res.render('index', params);
// next();
// });
app.get('/:show?/:season?/:episode?/:language?', function(req, res, next) {
	var
		headers = {
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
		},
		params = req.params || {},
		requestData = {},
		options = {
			headers: headers,
			data: {}
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

	requestData.shows = JSON.parse(localStorage.getItem('shows')).items || [];
	requestData.title = 'select show';

	if (params.show) {
		// call season list

		requestData.title = requestData.shows.slice().filter((s) => s.id == params.show).pop().name || 'title not loaded'
		// TODO:
		// if show is selected then load season list
		options.url = urls.ajaxSeasons;
		options.qs = {
			showID: params.show
		}
		// console.log('season: ' + params.season)
		request(options, function(error, response, body) {
			if (!error) {
				var
					html = body.replace(/<img\b[^>]*>/ig, ''),
					$ = cheerio.load(html, {
						normalizeWhitespace: true
					});
				console.log("season request sent");
				requestData.seasons = $('#qsiSeason option').map(function(i, el) {
					return {
						id: parseInt($(el).val()),
						name: $(el).text()
					}
				}).get();
				// TODO:
				// if season is selected then load episodes list

			} else {
				console.log("Error: " + error);
			}
		});
	}
	if (params.season) {
		// call episode list
		options.url = urls.ajaxEpisodes;
		options.qs = {
			showID: params.show,
			season: params.season
		}
		request(options, function(error, response, body) {
			if (!error) {
				var
					html = body.replace(/<img\b[^>]*>/ig, ''),
					$ = cheerio.load(html, {
						normalizeWhitespace: true
					});
				console.log("episode request sent");
				requestData.episodes = $('#qsiEp option').map(function(i, el) {
					return {
						id: $(el).val().split('x')[1],
						name: $(el).text()
					}
				}).get();
			} else {
				console.log("Error: " + error);
			}
		});
	}
	if (params.episode) {
		// call subtitle file list, all languages

		options.url = urls.ajaxFull;
		options.qs = {
			show: params.show,
			season: params.season
		}
		request(options, function(error, response, body) {
			if (!error) {
				var
					html = body.replace(/<img\b[^>]*>/ig, ''),
					$ = cheerio.load(html, {
						normalizeWhitespace: true
					}),
					rows = $('#season tr.epeven').filter((b, a) => parseInt($(a).find('td').eq(1).text()) == params.episode),
					langs = $('#langs tr');
				console.log("subs request sent");
				requestData.episode_subtitles = rows.map((i, el) => {
					return {
						version: $(el).find('td.c').eq(0).text(),
						ext: $(el).find('td').eq(2).find('a').attr('href'),
						link: $(el).find('td.c').eq(-1).find('a').attr('href'),
						lang: $(el).find('td').eq(3).text(),
						// checkbox: $(el).find('input').html()
						checkbox: $(el).find('input')
					};

				}).get().sort((a, b) => {
					var _lang = a.lang.localeCompare(b.lang);
					var _version = a.version.localeCompare(b.version);
					return _lang || _version;
				});
				// lanuages array
				requestData.langs = langs.map((i, el) => {
					return {
						lang: $(el).find('td').eq(0).text(),
						checkbox: $(el).find('input')
					};
				}).get().sort((a, b) => {
					var _lang = a.lang.localeCompare(b.lang);
					// var _version = a.version.localeCompare(b.version);
					return _lang;
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
	// TODO:
	// rewrite to promises
	setTimeout(() => {
		res.render('subtitles', requestData);
	}, 3000)


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