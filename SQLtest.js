var sql = require('./SQLLib.js');

//------------------------------------------------------------------------------
var indata = [2];
   sql.RunQL("SELECT USER_ID FROM user WHERE USER_PW = ?", indata, function (err, rows) {
       if (err) console.log('에러');
       else {
           console.log(rows[0].USER_ID);
       }
   });
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
//var str = 'insert into LOGHISTORY set LOG_USER_ID=? , C_ID=? , LOG_IN_DT = ? , C_DT = ? ';
//var indata = ['1','1','201605050101','201605050101'];

//RunDML(str, indata, function (err) {
//    if (err) {
//      console.log(err);
//    }
//    ckHistory = true;
//});
//
// var str = 'SELECT * FROM user where USER_ID = ? ';
//
//var json =1;
//RunQL(str,escape(json),function(err,rows){
//  console.log("결과:"+ rows);
//  console.log("에러:"+ err); 
//});
//
//RunQL('SELECT * FROM SETTING where ?','1=1',function(err,rows){
//     console.log("결과:"+ rows[0].SETT_AUTO_END_MIN);
//    //data.response.SETT_PW_CYCLE = rows[0].SETT_PW_CYCLE;
//  });
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
//var USER_ID = 1;
//var USER_PW = 2;
//var USER_TYPE = 'U';
//   var str = 'SELECT * FROM user where USER_ID = ? and USER_PW = ? and USER_TYPE = ?';
//   var indata = [USER_ID,USER_PW,USER_TYPE];
//   RunQL(str,indata,function(err,rows){
//       console.log("결과:"+ rows);
//        console.log("에러:"+ err); 
//    });
//------------------------------------------------------------------------------