var connection,
	sqlite3 = require('sqlite3').verbose();

exports.makeConnection = function(e) {
	return connection = new sqlite3.Database('workers.db');
};

exports.closeConnection = function (e) {
	connection.close();
}