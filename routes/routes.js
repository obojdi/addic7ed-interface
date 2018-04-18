var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
// });

// router.get('/', function(req, res, next) {
router.get('/:route', function(req, res, next) {
  // res.send('WWWWW with a resource');
	// res.send('req: ' + req.params.route);
	res.send('req: ' + JSON.stringify(req.params));
	// console.log(req.params.fname)
  // res.render('index', { title: 'Hey', message: 'Hello there!'});
});

module.exports = router;
