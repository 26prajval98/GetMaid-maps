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
	if (req.query.pin) {
		http.get("https://apis.mapmyindia.com/advancedmaps/v1/ga4airl3ue5u8gq56l3zsgoklhbiu31m/geo_code?addr=" + req.query.pin, (req) => {
			var body
			req.on("data", (data) => {
				body += data
			})
			req.on("end", () => {
				body = body.slice(body.indexOf("{"))
				body = JSON.parse(body)
				if (body.results.length)
					res.json({ lat: body.results[0].lat, lon: body.results[0].lng })
				else {
					res.statusCode = 404
					res.json({Error : "Pincode not found"})
				}
			})
		})
	}
	else{
		res.setHeader('Content-type','text/html')
		res.send("<h1>Welcome to GetMaid-maps</h1>")
	}
});

router.get('/distance', function (req, res, next) {
	var lat1 = req.query.lat1
	var lat2 = req.query.lat2
	var lon1 = req.query.lon1
	var lon2 = req.query.lon2

	res.json({
		distance: distance(lat1, lon1, lat2, lon2)
	})

});

router.get('/distance/:pin1/:pin2', function (req, res, next) {
	if (req.params.pin1 && req.params.pin2) {
		http.get("https://apis.mapmyindia.com/advancedmaps/v1/ga4airl3ue5u8gq56l3zsgoklhbiu31m/geo_code?addr=" + req.params.pin1, (r) => {
			var body
			r.on("data", (data) => {
				body += data
			})
			r.on("end", () => {
				body = body.slice(body.indexOf("{"))
				body = JSON.parse(body)
				if (body.results.length) {
					var lat1 = Number(body.results[0].lat)
					var lon1 = Number(body.results[0].lng)
					http.get("https://apis.mapmyindia.com/advancedmaps/v1/ga4airl3ue5u8gq56l3zsgoklhbiu31m/geo_code?addr=" + req.params.pin2, (req) => {
						var body
						req.on("data", (data) => {
							body += data
						})
						req.on("end", () => {
							body = body.slice(body.indexOf("{"))
							body = JSON.parse(body)
							if (body.results.length){
								var lat2 = Number(body.results[0].lat)
								var lon2 = Number(body.results[0].lng)
								res.json({ "distance": distance(lat1, lon1, lat2, lon2) })
							}
							else {
								res.statusCode = 404
								res.json({Error : "Pincode 2 not found"})
							}
						})
					})
				}
				else {
					res.statusCode = 404
					res.json({Error : "Pincode 1 not found"})
				}
			})
		})
	} else {
		res.json({ Error : "Pin1 and Pin2 must be present" })
	}
})

module.exports = router;
