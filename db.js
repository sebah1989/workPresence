var connection,
	sqlite3 = require('sqlite3').verbose();

exports.makeConnection = function(e) {
	return connection = new sqlite3.Database('/home/sebastian/Dokumenty/node/workers.db');
};

exports.getAllWorkers = function(e) {
	connection.all("SELECT name, surname FROM people", function(err, rows) {
		if (!err) {
			console.log("test")
			return rows;
		} else {

			return [];
		}
	});
};

exports.closeConnection = function (e) {
	connection.close();
}