var svcfunc = require('./SVCfunc.js');
//var fs = require('fs');

//날짜유틸
//require('date-utils');
//var dt = new Date();

//소켓 : https://mylko72.gitbooks.io/node-js/content/chapter4/chapter4_1.html
//소켓 서버 
var net = require('net');

//서버 구현 
var server = net.createServer(function (client) {
    console.log('Client connection: ');
    console.log('   local = %s:%s', client.localAddress, client.localPort);
    console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);

    client.setTimeout(500);
    client.setEncoding('utf8');
    //데이터 리시브.
    client.on('data', function (data) {
        try {
            var jsonData = JSON.parse(data);
            //console.log("RECV: "+jsonData);
            svcfunc.CheckJson(client, jsonData);
        }
        catch (e) {
            //if (data == "stop") {
            //    server.close();
            //    return;
            //}
            console.log('에러:' + e.message);
            console.log('Received data from client on port %d: %s',
              client.remotePort, data.toString());
            //console.log('  Bytes received: ' + client.bytesRead);
            var recvData = { "svcNm": "Error", "response": { "RSP_CD": "99999","ERROR" : "jsonData Pasing Error"} };
            ResponseData(client, JSON.stringify(recvData));
            //ResponseData(client, 'Sending: ' + data.toString());
            //console.log('  Bytes sent: ' + client.bytesWritten);
        }
    });
    //연결 해제 
    client.on('end', function () {
        console.log('Client disconnected');
        server.getConnections(function (err, count) {
            console.log('Remaining Connections: ' + count);
        });
    });
    //소켓 에러
    client.on('error', function (err) {
        console.log('Socket Error: ', JSON.stringify(err));
    });
    //소켓 타임아웃 
    client.on('timeout', function () {
        console.log('Socket Timed out');
    });
});


//서버 실행 
exports.listen = function () {

    server.listen(8107, function () {
        console.log('Server listening: ' + JSON.stringify(server.address()));
        server.on('close', function () {
            console.log('Server Terminated');
        });
        server.on('error', function (err) {
            console.log('Server Error: ', JSON.stringify(err));
        });
    });
}

//클라로 데이터 리스폰스 
var ResponseData = function (socket, data) {
    var success = !socket.write(data);
    if (!success) {
        (function (socket, data) {
            socket.once('drain', function () {
                ResponseData(socket, data);
            });
        })(socket, data);
    }
}
exports.ResponseData = ResponseData;


