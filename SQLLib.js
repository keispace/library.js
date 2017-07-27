// sql : http://bcho.tistory.com/892
//https://github.com/felixge/node-mysql
var mysql = require('mysql');
var cmnUtil = require('./cmnUtil.js');

var pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'clts66',
    database: 'test',
    multipleStatements: true
});
pool.connectionLimit = 20; //동시 접속제한



//SELECT문 (리턴 있는거. )
var RunQL = function (sql, json, cb) {
    pool.getConnection(function (err, connection) {
        if (err) cmnUtil.LogErr(err);
        connection.query(sql, json, function (err, rows) {
            if (err) cmnUtil.LogErr(err);
            cb(err, rows);
            connection.release();
        });
    });
}
exports.RunQL = RunQL;

//리턴 없는 DML. update, delete
var RunDML = function (sql, json, cb) {
    pool.getConnection(function (err, connection) {
        if (err) { cb(err); return; }

        connection.query(sql, json, function (err) {
            connection.release();
            cb(err);
        });
    });
}
exports.RunDML = RunDML
//인젝션 방지용 
exports.escape = function (str) {
    return mysql.escape(str);
}


