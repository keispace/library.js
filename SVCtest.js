var sql = require('./SQLLib.js');
var svclib = require('./SVCLib.js');
var cmnUtil = require('./cmnUtil.js');
var net = require('net');




//------------------------------------------------------------------------------
//테스트 데이터
//------------------------------------------------------------------------------
var json = { 
    svcNm: 'C_ReadBookList',  
    REQ_IP: '202.254.20.111',  
    request:    { 
        CRUD_FLAG: 'R',
        JOB_USER_ID :'',
        BOOK_CD:'',
        BOOK_NM:'',
        BOOK_SUB_NM :'',
        BOOK_CLASS :'',
        BOOK_ISBN :'',
        BOOK_PUB_DATE :'',
        BOOK_PUBLISHER :'',
        BOOK_AUTHOR :'',
        RECO_NM :''
    },  
    response:    { 
        RSP_CD :'',
        RSP_NUM :'',
        BOOK_CD :[],
        BOOK_NM :[],
        BOOK_SUB_NM :[],
        BOOK_CLASS :[],
        BOOK_ISBN :[],
        BOOK_PUB_DATE :[],
        BOOK_PUBLISHER :[],
        BOOK_AUTHOR :[],
        BOOK_PATH :[],
        RECO_NM :[]
    } 
};

json = JSON.stringify(json,'',2);
//return: {"svcNm":"C_Login","REQ_IP":"202.254.20.111","request":{"USER_TYPE":"U","USER_ID":"1","USER_PW":"1","USER_GROUP_CODE":"1","MAC_ADDRESS":""},"response":{"RSP_CD":"01100","ERROR":"infomation not matting","SETT_AUTO_END_MIN":"5","SETT_PW_CYCLE":"5"}}
console.log(json);

// 서버 접속
var socket = net.connect({port : 8107});
socket.on('connect', function(){
    console.log('connected & Send : '+ json);
        socket.write(json);
});

// 서버로부터 받은 데이터를 화면에 출력
socket.on('data', function(chunk){
    console.log('recv:' + chunk);
});
// 접속이 종료됬을때 메시지 출력
socket.on('end', function(){
    console.log('disconnected.');
});
// 에러가 발생할때 에러메시지 화면에 출력
socket.on('error', function(err){
    console.log(err);
});
// connection에서 timeout이 발생하면 메시지 출력
socket.on('timeout', function(){
    console.log('connection timeout.');
});


