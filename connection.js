
var conf = require('./config/conf');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;


// database connection
var database  = conf.database;

var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect(database, { useNewUrlParser:true }, function(err, db) {
  if (err) throw err;
  	console.log("Database created!");
  db.close();
});

mongoose.connect(database)
	.then(() =>  console.log('Connection succesful with database named testdb'))
	.catch((err) => console.error(err));

mongoose.Promise = global.Promise;

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))










