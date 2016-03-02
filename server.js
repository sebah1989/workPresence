/*jslint unparam: true, node: true */
/*globals require, exports */
(function() {
    "use strict";
    var db = require('./db.js'),
        presence = require('./check_presence'),
        serveStatic = require('serve-static'),
        finalhandler = require('finalhandler'),
        http = require('http'),
        serve = serveStatic('static', {
            index: ['html/index.html']
        }),
        server = http.createServer(function(req, res) {
            var url = req.url;
            if (url === "/get_students") {
                db.getWorkers().then(function(result) {
                    res.write(JSON.stringify(result));
                    res.end();
                }).catch(
                    function() {
                        res.write(JSON.stringify([]));
                        res.end();
                    });
            } else if (url === "/get_presences") {
                db.getPresences().then(function(result) {
                    res.write(JSON.stringify(result));
                    res.end();
                }).catch(
                    function() {
                        res.write(JSON.stringify([]));
                        res.end();
                    });
            } else {
                serve(req, res, finalhandler(req, res));
            }
        });

    presence.check();

    server.listen(3000);
}());