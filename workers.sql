CREATE TABLE 'workers' (
	'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'name' VARCHAR(32) NOT NULL,
	'surname' VARCHAR(32) NOT NULL,
	UNIQUE ('name', 'surname') ON CONFLICT IGNORE
);

CREATE TABLE 'presence' (
	'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	'become_present' TIME DEFAULT (time(CURRENT_TIME, 'localtime')),
	'become_absent' TIME,
	'workday' DATE DEFAULT CURRENT_DATE,
	'worker_id' INTEGER NOT NULL,
	FOREIGN KEY('worker_id') REFERENCES 'people'('id')
);

-- insert into workers(name, surname) values ('jacek', 'gacek');
-- insert into presence(worker_id) values (1);