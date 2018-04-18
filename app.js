var
	express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	stylus = require('stylus');


var index = require('./routes/index');
var users = require('./routes/users');
var routes = require('./routes/routes');
var texts = require('./app/js/data');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "pug");


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());

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


app.use('/', index);
app.get('/:route', function(req, res, next) {
	res.render(req.params.route, texts);
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