var db = require('./db.js'),
 presence = require('./check_presence');
 // http = require('http')

presence.check();
// var server = http.createServer(function(req, res) {
// 	var method = req.method,
// 		url = req.url,
// 		body = [];
// 	req.on('error', function(err) {
// 		console.log(err);
// 	}).on('data', function(chunk) {
// 		console.log(chunk);
// 		body.push(chunk);
// 	}).on('end', function() {
// 		body = Buffer.concat(body).toString();
// 	});

// 	res.on('error', function(err){
// 		console.log(err);
// 	})
// 	res.setHeader('Content-type', 'application/json');
// 	res.write(JSON.stringify("OK"));
// 	res.end();
// }).listen(8080);