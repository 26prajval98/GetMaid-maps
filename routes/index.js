var express = require('express');
var http = require('https')
var router = express.Router();

function distance(lat1, lon1, lat2, lon2) {
	var R = 6371; // km
	var dLat = toRad(lat2 - lat1);
	var dLon = toRad(lon2 - lon1);
	var lat1 = toRad(lat1);
	var lat2 = toRad(lat2);

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
	return Value * Math.PI / 180;
}

router.get('/', function (req, res, next) {
	http.get("https://apis.mapmyindia.com/advancedmaps/v1/ga4airl3ue5u8gq56l3zsgoklhbiu31m/geo_code?addr=" + req.query.pin, (req) => {
		var body
		req.on("data", (data) => {
			body += data
		})
		req.on("end", () => {
			body = body.slice(body.indexOf("{"))
			body = JSON.parse(body)
			res.json({ lat: body.results[0].lat, lon: body.results[0].lng })
		})
	})
});

router.get('/distance', function (req, res, next) {
	var lat1 = req.query.lat1
	var lat2 = req.query.lat2
	var lon1 = req.query.lon1
	var lon2 = req.query.lon2
	console.log(typeof (lat1))

	res.json({
		distance: distance(lat1, lon1, lat2, lon2)
	})

});

module.exports = router;
