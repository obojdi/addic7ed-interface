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


// app.use(logger('dev'));
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
app.use(express.static(path.join(__dirname, 'app')));


app.get('/favicon.ico', function(req, res) {
	res.status(204);
});
app.use('/', index);
app.get('/a', function(req, res) {
	var params = {
		title: 'Hey',
		message: 'Hello there!'
	};
	res.render('index', {
		params
	});

});
app.get('/:route', function(req, res, next) {

	var
		requestData = null;
	// parser
	const url = 'http://www.addic7ed.com/serie/Eureka/2/1/1';
	let req__ = request(url, function(error, response, body) {

		console.log('statusCode:', response && response.statusCode);
		if (!error) {
			var
				$page = cheerio.load(body, {
					normalizeWhitespace: true
				}),
				title = $page(".titulo").text().replace(/\s+/g, " ").trim(),
				requestData = {
					title: title || 'not loaded'
				};
			res.render(req.params.route, {
				requestData
			});
			console.log({
				requestData
			});
		} else {
			console.log("Произошла ошибка: " + error);
		}
	});

});

app.use('/users', users);

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
	res.render('error');
});

module.exports = app;