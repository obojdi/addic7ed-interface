var
	express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	stylus = require('stylus'),
	request = require('request'),
	cheerio = require('cheerio'),
	// 

	index = require('./routes/index'),
	users = require('./routes/users'),
	routes = require('./routes/routes'),
	texts = require('./app/js/data'),
	// 
	// 
	app = express();



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


app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
// extended: false
// }));

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

app.get('/', function(req, res) {
	var params = {
		title: 'Hey',
		message: 'Hello there!'
	};
	res.render('index', params);
	next();
});
app.get('/:route', function(req, res, next) {

	var
		requestData = {};
	// parser
	const url = 'http://www.addic7ed.com/serie/Eureka/2/1/1';
	const ajaxShows = 'http://www.addic7ed.com/ajax_getShows.php';
	const ajaxSeasons = 'http://www.addic7ed.com/ajax_getSeasons.php?showID=94';
	const ajaxEpisodes = 'http://www.addic7ed.com/ajax_getEpisodes.php?showID=94&&season=2';

	let req__ = request(url, function(error, response, body) {

		console.log('statusCode:', response && response.statusCode);
		if (!error) {
			var
				$ = cheerio.load(body, {
					normalizeWhitespace: true
				}),
				serverDown = $.text().match('mysql_pconnect') ? true : false,
				title;
			// console.log($.html())
			if (serverDown) {
				requestData.title = 'addic7ed server down'
				// console.log($.html())
			} else {
				requestData.title = $(".titulo").text().replace(/\s+/g, " ").trim() || 'title not loaded';;
				requestData.shows = $('#qsShow option').map(function(i, el) {
					return {
						id: $(el).val(),
						name: $(el).text()
					}
				});
				requestData.seasons = $('#qsShow option').map(function(i, el) {
					return {
						id: $(el).val(),
						name: $(el).text()
					}
				});
				requestData.episodes = $('#qsShow option').map(function(i, el) {
					return {
						id: $(el).val(),
						name: $(el).text()
					}
				});
				/*
								.map(a => {
									id: a.val(),
									'name': a.text()
								})
				*/
			}
			// $('table.tabel95').filter((i,el)=>{return $(el).children() })
			requestData.episode_subtitles = $('#container95m table .tabel95').map((i, el) => {

				return {
					version: $(el).find('td.NewsTitle').text(),
					lang: $(el).find('td.language').text(),
					link: $(el).find('a.buttonDownload').attr('href')
				};

			});
			res.render(req.params.route, requestData);
			// console.log(requestData.shows);
		} else {
			console.log("Error: " + error);
		}
	});

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