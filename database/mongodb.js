/**
 * Created by neusoft on 2016/4/26.
 */

var mongoose = require('mongoose');
var dbConfig = require('../config/db');

var db = {}, connectionString = '';

connectionString = dbConfig.protocol + '://'
    + dbConfig.hostname + ':'
    + dbConfig.port + '/'
    + dbConfig.database;
function connect() {
    //FIXME!!!
    mongoose.connect(connectionString);
    return mongoose.connection;
}

function listen() {
    console.log('db connected: ' + connectionString);
}

db = connect()
    .on('error', console.log)
    .on('open', listen);


module.exports = db;

