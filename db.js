/*jslint unparam: true, node: true */
/*globals require, exports, Promise */
(function() {
    "use strict";
    var connection,
        sqlite3 = require('sqlite3').verbose();

    exports.makeConnection = function(e) {
        connection = new sqlite3.Database('workers.db');
        return connection;
    };

    exports.getWorkers = function(e) {
        return new Promise(function(fullfill, reject) {
            connection.all("SELECT id, name, surname FROM workers", function(err, rows) {
                if (err) {
                    reject(err);
                } else {
                    fullfill(rows);
                }
            });
        });
    };

    exports.getPresences = function(e) {
        return new Promise(function(fullfill, reject) {
            connection.all("SELECT id, become_present, become_absent, workday, worker_id FROM presence", function(err, rows) {
                if (err) {
                    reject(err);
                } else {
                    fullfill(rows);
                }
            });
        });
    };

    exports.closeConnection = function(connection) {
        if (connection.open) {
            connection.close(function(e) {
                console.log(e);
            });
        }
    };
}());