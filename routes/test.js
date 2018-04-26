var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	check();
	console.log(requestData);
	requestData.params = {
		show: 94,
		season: 2,
		episode: 3
	}
	// cache.check();
		requestData.shows = JSON.parse(localStorage.getItem('shows')).items || [];

		requestData.title = requestData.shows.slice().filter((s) => s.id == requestData.params.show).pop().name || 'title not loaded'

	let send_requests = () => {
		let i;
		let promises = [];

		// let rq = Q.when(request_shows).then(results => console.log(results.resolve));

		// promises.push(request_shows(options.shows), request_seasons(options.seasons), check());
		promises.push(request_shows(options.shows));
		Promise.all(promises)
			.then((results) => {
				console.log(" ");
				console.log("All done");
				console.log(requestData);
				res.render('subtitles', requestData);

				// render view
			})
			.catch((e) => {
				// Handle errors here
			});
	}
	send_requests();

});

module.exports = router;
