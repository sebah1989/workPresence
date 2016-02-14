/*globals require, exports, setInterval, Buffer */
/*jslint unparam: true, node: true */
(function() {
    "use strict";
    var http = require('http'),
        options = {
            host: '127.0.0.1',
            port: 9000
        },
        cheerio = require('cheerio'),
        db = require('./db.js'),
        db_connection = db.makeConnection(),
        workers_presences = {},
        collectWorkersInWorkStatus = function(html) {
            var $ = cheerio.load(html),
                rows = $("body").find("tr"),
                cells,
                presences = {},
                name,
                surname,
                present;
            rows.each(function(i, item) {
                cells = $(item).find("td");
                if (cells.length === 4 || cells.length === 6) {
                    surname = $(cells[0]).text().trim();
                    name = $(cells[1]).text().trim();
                    present = cells.length === 4 ? true : false;
                    presences[name + "_" + surname] = {
                        name: name,
                        surname: surname,
                        present: present
                    };
                }
            });
            return presences;
        },
        formatDate = function(date_object) {
            var day = date_object.getDate(),
                month = date_object.getMonth() + 1;
            day = day < 10 ? "0" + day : day;
            month = month < 10 ? "0" + month : month;
            return date_object.getFullYear() + "-" + month + "-" + day;
        },
        createMissingWorkersInDb = function(current_db_state, current_web_page_state) {
            var i, length = current_db_state.length,
                key, worker, db_worker, worker_exist;
            for (key in current_web_page_state) {
                if (current_web_page_state.hasOwnProperty(key)) {
                    worker = current_web_page_state[key];
                    worker_exist = false;
                    for (i = 0; i < length; i += 1) {
                        db_worker = current_db_state[i];
                        if (db_worker.name === worker.name && db_worker.surname === worker.surname) {
                            worker_exist = true;
                        }
                    }
                    if (!worker_exist) {
                        db_connection.run("INSERT INTO workers(name, surname) VALUES (?, ?)", [worker.name, worker.surname]);
                    }
                }
            }
        },
        handleDbStateForWorker = function(worker, current_date) {
            db_connection.get("SELECT w.id, p.become_present, p.become_absent, p.workday, p.id as presence_id FROM workers w INNER JOIN presence p ON " +
                "w.id = p.worker_id AND w.name = ? AND w.surname = ? AND workday = ? ORDER BY workday, p.become_present DESC", [worker.name, worker.surname, current_date],
                function(err, row) {
                    if (!err && !row && worker.present) {
                        db_connection.run("INSERT INTO presence(worker_id) SELECT id FROM workers WHERE name = ? AND surname = ?", [worker.name, worker.surname],
                            function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                    } else if (!err && row && worker.present) {
                        if (!(row.become_absent === null)) {
                            db_connection.run("INSERT INTO presence(worker_id) VALUES(?)", [row.id],
                                function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                        }
                    } else if (!err && row && !worker.present) {
                        if (row.become_absent === null) {
                            db_connection.run("UPDATE presence set become_absent = time(CURRENT_TIME, 'localtime') where id = ?", [row.presence_id],
                                function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                        }
                    } else if (err) {
                        console.log(err);
                    }
                });
        },
        updateWorkersPresencesInDb = function(workers) {
            var key, worker,
                current_date = formatDate(new Date());
            for (key in workers) {
                if (workers.hasOwnProperty(key)) {
                    worker = workers[key];
                    handleDbStateForWorker(worker, current_date);
                }
            }
        },
        getWorkersWhichPresenceChanged = function(previous_presences, current_presences) {
            var changed_workers = {},
                key;
            for (key in current_presences) {
                if (current_presences.hasOwnProperty(key)) {
                    if (!(previous_presences.hasOwnProperty(key))) {
                        changed_workers[key] = JSON.parse(JSON.stringify(current_presences[key]));
                    } else if (current_presences[key].present !== previous_presences[key].present) {
                        changed_workers[key] = JSON.parse(JSON.stringify(current_presences[key]));
                    }
                }
            }
            return changed_workers;
        };
    exports.check = function() {
        setInterval(function() {
            http.get(options, function(res) {
                var body = [],
                    presence_changed,
                    current_workers_presences;
                res.on('data', function(chunk) {
                    body.push(chunk);
                });
                res.on('end', function() {
                    body = Buffer.concat(body).toString();
                    if (Object.keys(workers_presences).length === 0) {
                        workers_presences = collectWorkersInWorkStatus(body);
                        db_connection.all("SELECT name, surname FROM workers", function(err, rows) {
                            if (!err && rows) {
                                createMissingWorkersInDb(rows, workers_presences);
                                updateWorkersPresencesInDb(workers_presences);
                            } else if (err) {
                                console.log(err);
                            }
                        });
                    } else {
                        current_workers_presences = collectWorkersInWorkStatus(body);
                        presence_changed = getWorkersWhichPresenceChanged(workers_presences, current_workers_presences);
                        workers_presences = current_workers_presences;
                        updateWorkersPresencesInDb(presence_changed);
                    }
                });

            });
        }, 3000);
    };
}());