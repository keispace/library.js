
var fs = require('fs');
require('date-utils');
var dt = new Date();

exports.LogErr = function (err) {
    WriteLog("ERR", "Error", err);
}

exports.LogSVC = function (svcNm, data) {
   
    WriteLog("SVC", svcNm, data);
}

exports.isYN = function (str) {
    if (str == "Y") return true;
    else return false;
}



var WriteLog = function (type, title, data) {
    var dir = './Log';
    var fileNm = '/' + type + dt.toFormat('YYMMDD') + '.log';
    if (data) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.appendFileSync(dir + fileNm,
          '[' + dt.toFormat('HH24:MI:SS.LL') + ']' + title + '\t\t' + data + '\r\n');
    }
}
