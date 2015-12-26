'use strict'
var mongo = require('mongodb'),
	config = require('config');

function resetAll(name, data) {
    var server = new mongo.Server(config.db.server, config.db.port),
        conn = new mongo.Db(config.db.name, server, {safe: true});

	return new Promise((resolve,reject) => {
		//console.log('open');
		conn.open((err,db) => {
			if (err) {
				//console.error(err);
				return reject(err);
			}
			if (!db) {
				//console.error('no db');
				return reject('Could not connect to database.');
			}
			//console.log('collection');
			let collection = db.collection(name);
	        if (collection) {
	        	collection.drop();
	        }
			db.createCollection(name, (err, coll) => {
				if (err) {
					//console.error(err);
					db.close();
					return reject(err);
				}
				if (!coll) {
					//console.error('no collection');
					db.close();
					return reject('Could not create collection ' + name);
				}

				//console.log('insert');
				coll.insert(data, (err, result) => {
					if (err) {
						//console.error(err);
						db.close();
						return reject(err);
					}
					//console.log('done');
					db.close();
					resolve(true);
				});
			});
		});
	});
}

function retrieveAll(name) {
	var server = new mongo.Server(config.db.server, config.db.port),
        conn = new mongo.Db(config.db.name, server, {safe: true});

	return new Promise((resolve,reject) => {
		conn.open((err,db) => {
			if (err) {
				return reject(err);
			}
			if (!db) {
				return reject('Could not connect to database.');
			}
			let collection = db.collection(name);
			collection.find({}, (err, cursor) => {
				if (err) {
					db.close();
					return reject(err);
				}
				cursor.toArray((err, data) => {
					if (err) {
						db.close();
						return reject(err);
					}
					db.close();
					resolve(data);
				});
			});
		});
	});
}

module.exports = {
	retrieveAll: retrieveAll,
    resetAll: resetAll
};
