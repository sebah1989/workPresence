var http = require('http'),
	fs = require('fs');

http.createServer(function(request, response) {
	fs.readFile('./index.html', {
		encoding: 'utf-8'
	}, function(err, html) {
		if (err) {
			throw err;
		}
		response.writeHeader(200, {
			"Content-Type": "text/html"
		});
		response.write(html);
		response.end();
	});

}).listen(9000);