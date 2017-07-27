//sql js 호출 
var sql = require('./SQLLib.js');
var svclib = require('./SVCLib.js');
var cmnUtil = require('./cmnUtil.js');
//var fs = require('fs');

//날짜유틸
require('date-utils');
//var dt = new Date();



//*****************************************************************************
// 일반 사용 함수 선언부
//*****************************************************************************

//받은 데이터 검증 및 명령 구분 
function CheckJson(client, jsonobj) {
    //exports.CheckJson = function (client, jsonobj) {
    switch (jsonobj.svcNm) {
        case "M_SetUser":
            M_SetUser(client, jsonobj);
            break;
        case "C_Login":
            C_Login(client, jsonobj);
            break;
        case "C_Logout":
            C_Logout(client, jsonobj);
            break;
        case "C_UpdatePW":
            C_UpdatePW(client, jsonobj);
            break;
        case "C_ReadBookList":
            C_ReadBookList(client, jsonobj);
            break;
        default:
            console.log("파싱안됨." + jsonobj.svcNm);
            //jsonobj.response.RSP_CD = "99999";
            //svclib.ResponseData(client, JSON.stringify(jsonobj));
            ReturnSVC(client, jsonobj, "99999", "ErrData");
            break;
    }
}
exports.CheckJson = CheckJson;

//서비스 응답
function ReturnSVC(client, data, CD, err) {
    data.response.RSP_CD = CD;
    if (err) data.response.ERROR = err;
    console.log('return: ' + JSON.stringify(data));
    svclib.ResponseData(client, JSON.stringify(data));
    cmnUtil.LogSVC(data.request.svcNm, CD + ": " + ", ");
}

//로그인/아웃 히스토리 처리 함수 
function Insert_LogHistory(client, data, inoutFlag) {
    //로그아웃때는 별다른 리턴하지 않고 끝냄.
    var jobDt = new Date().toFormat('YYYYMMDDHH24MI');
    var indata;
    var str;

    if (inoutFlag) {
        str = 'update LOGHISTORY  set U_ID=?, LOG_OUT_DT = ?, U_DT = ? where LOG_USER_ID=? and LOG_OUT_DT is null';
        indata = [data.request.USER_ID, jobDt, jobDt, data.request.USER_ID];
    } else {
        str = 'insert into LOGHISTORY set  C_ID=?, LOG_IN_DT = ?, C_DT = ?, LOG_USER_ID=?';
        indata = [data.request.USER_ID, jobDt, jobDt, data.request.USER_ID, ];
    }


    sql.RunDML(str, indata, function (err) {
        if (inoutFlag) return;
        if (err) {
            ReturnSVC(client, data, "88888", err.code);

        } else {
            ReturnSVC(client, data, "01100", "");

        }

    });
}


//nullable 데이터 구축함수 return string
//col = data 로 where 연결함. 
//inWhere ==false면 and 연결
function setWhereSql(col, data, indata, isWhere) {
    var sql = '';
    if (data) {
        var sql = (isWhere === true) ? ' WHERE ' : ' AND '
        sql += ' ' + col + ' = ? ';
        indata.push(data);
        return sql;
    } else return '';
}

//추천명-> 추천코드 조회 함수
function getRecoCD(RECO_NM) {
    var indata = [RECO_NM];
    sql.RunQL("SELECT RECO_CD FROM RECOMANTATION WHERE RECO_NM = ?", indata, function (err, rows) {
        if (err) return '';
        else {
            //있으면 데이터 구성해서 던지자.
            return rows[0].RECO_CD || '';
        }
    });
}



//*****************************************************************************
// 서비스 선언부
//*****************************************************************************


//TODO서비스09: 사용자 등록
//TODO 체크루틴 하나도 업슴
function M_SetUser(client, data) {
    var str = 'insert into user set ?';
    data.request.C_DT = new Date().toFormat('YYYYMMDDHH24MI');
    data.request.C_ID = data.reqID;
    data.request.U_DT = data.request.C_DT;
    data.request.U_ID = data.request.C_ID;

    sql.RunDML(str, data.request, function (err) {
        if (err) {
            ReturnSVC(client, data, "88888", err.code);

        }
        else {
            ReturnSVC(client, data, "09100", "");
        }
    });
}

//서비스01: 로그인
function C_Login(client, data) {
    //id, pw cd 검증후에 성공/실패 반환
    //있는지 select 없으면 실패. 있으면 접근정보 update

    //010에러 확인(기본 데이터 검증)
    if (!data.request.USER_ID) {
        ReturnSVC(client, data, "01000", "ID is Empty");
        return;
    }
    if (!data.request.USER_PW) {
        ReturnSVC(client, data, "01001", "PW is Empty");
        return;
    }
    if (!data.request.USER_GROUP_CODE) {
        ReturnSVC(client, data, "01002", "group code is Empty");
        return;
    }

    var jobDt = new Date().toFormat('YYYYMMDDHH24MI');

    //설정값 조회
    sql.RunQL('SELECT * FROM SETTING WHERE ?', '1=1', function (err, rows) {
        if (err) ReturnSVC(client, data, "88888", 'user: ' + err.code);
        else {
            data.response.SETT_AUTO_END_MIN = rows[0].SETT_AUTO_END_MIN;
            data.response.SETT_PW_CYCLE = rows[0].SETT_PW_CYCLE;

            //정보 확인 
            var str = "";
            var indata = [];
            //유저 관리자 구분
            if (data.request.USER_TYPE == "U") {
                //multiQuery
                str = 'SELECT * FROM user where USER_ID = ? and USER_PW = ? and USER_TYPE = ?;SELECT * FROM user where USER_ID = ' + sql.escape(data.request.USER_ID) + ' and USER_GROUP_CODE =' + sql.escape(data.request.USER_GROUP_CODE);
                indata = [data.request.USER_ID, data.request.USER_PW, data.request.USER_TYPE];
            } else {
                //TODO MAC주소 확인 따로 해야됨. 
                //var macStr = 'SELECT * FROM mac where USER_ID = ' + data.request.USER_ID + ' and MAC_ADDRESS =' + data.request.MAC_ADDRESS;
                //multiQuery
                str = 'SELECT * FROM user where USER_ID = ? and USER_PW = ? and USER_TYPE = ?; SELECT * FROM mac where USER_ID = ' + sql.escape(data.request.USER_ID) + ' and MAC_ADDRESS =' + sql.escape(data.request.MAC_ADDRESS);
                indata = [data.request.USER_ID, data.request.USER_PW, data.request.USER_TYPES];

            }
            cmnUtil.LogSVC("C_Login", "로그인 시도: IP(" + data.REQ_IP + "), ID(" + sql.escape(data.request.USER_ID) + "), DT(" + jobDt + ")")
            sql.RunQL(str, indata, function (err, rows) {
                if (err) ReturnSVC(client, data, "88888", 'user: ' + err.code);
                else {

                    if (rows[0].length === 0 || rows[1].length === 0) ReturnSVC(client, data, "01100", "infomation not matting");
                    else {
                        data.response.SVC_DT = new Date().toFormat('YYYYMMDDHH24MI');
                        data.response.USER_PW_RESET_DATE = rows[0][0].USER_PW_RESET_DATE

                        //암호변경일 확인 해서 초과됬으면 로그인 안함.
                        if (Number(data.response.USER_PW_RESET_DATE) + Number(data.response.SETT_PW_CYCLE) > Number(new Date().toFormat('YYYYMMDD'))) ReturnSVC(client, data, "01101", 'PW Change Limit Exceed');
                        else {
                            //접근제한여부 확인해서 로그인 안함.
                            if (!cmnUtil.isYN(rows[0][0].USER_ENABLE_FLAG)) ReturnSVC(client, data, "01102", 'Login Progibited');
                            else {
                                //log히스토리 확인해서 로그아웃 안한 거 있으면(접속중). 로그인 시각 확인해서 종료시간 이전이면 막음. 
                                str = 'SELECT * FROM LOGHISTORY where LOG_USER_ID = ' + sql.escape(data.request.USER_ID) + ' and LOG_OUT_DT is null';
                                sql.RunQL(str, indata, function (err, rows) {
                                    if (err) ReturnSVC(client, data, "88888", 'history: ' + err.code);
                                    else {
                                        if (rows.length == 0) {
                                            //데이터 없음. 정상. 
                                            Insert_LogHistory(client, data);
                                        } else {
                                            //데이터 있음. -> 로그아웃 안됨. 
                                            var loginDt = rows[0].LOG_IN_DT

                                            if (Number(loginDt) + Number(data.response.SETT_AUTO_END_MIN) < Number(new Date().toFormat('YYYYMMDDHH24MI'))) {
                                                //종료시간 이전. 로그인 막음. 
                                                ReturnSVC(client, data, "01103", "Login Duplicated");
                                            } else {
                                                //종료시간 이후. 
                                                //로그아웃 처리하고 
                                                Insert_LogHistory(client, data, "out");
                                                //다시 로그인
                                                Insert_LogHistory(client, data);
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }
    });

}

//서비스02: 로그아웃
function C_Logout(client, data) {
    //id기준으로 해당 id 히스토리에 로그아웃 시간 기록
    Insert_LogHistory(client, data, "out");
    ReturnSVC(client, data, "02100", "");
}

//서비스03: 접속암호 변경
function C_UpdatePW(client, data) {

    var str = '';
    var indata = [];
    //유저 관리자 구분
    if (data.request.USER_TYPE == "U") {
        str = 'SELECT * FROM user where USER_ID = ? and USER_PW = ? and USER_TYPE = ?;SELECT * FROM user where USER_ID = ' + sql.escape(data.request.USER_ID) + ' and USER_GROUP_CODE =' + sql.escape(data.request.USER_GROUP_CODE);
        indata = [data.request.USER_ID, data.request.USER_PW, data.request.USER_TYPE];
    } else {

        str = 'SELECT * FROM user where USER_ID = ? and USER_PW = ? and USER_TYPE = ?; SELECT * FROM mac where USER_ID = ' + sql.escape(data.request.USER_ID) + ' and MAC_ADDRESS =' + sql.escape(data.request.MAC_ADDRESS);
        indata = [data.request.USER_ID, data.request.USER_PW, data.request.USER_TYPES];

    }
    cmnUtil.LogSVC("C_UpdatePW", "pw변경시도: IP(" + data.REQ_IP + "), ID(" + sql.escape(data.request.USER_ID) + "), DT(" + jobDt + ")");
    //정보 확인
    sql.RunQL(str, indata, function (err, rows) {
        if (err) ReturnSVC(client, data, "88888", 'user: ' + err.code);
        else {
            if (rows[0].length === 0 || rows[1].length === 0) ReturnSVC(client, data, "03101", "infomation not matting");
            //암호변경
            var str2 = 'UPDATE user set USER_PW = ? and U_DT =' + new Date().toFormat('YYYYMMDDHH24MI') + ' and USER_PW_RESET_DATE=' + new Date().toFormat('YYYYMMDDHH24MI') +
                ' where USER_ID = ? and USER_PW = ? and USER_TYPE = ? and USER_GROUP_CODE = ? ';
            var indata2 = [data.request.USER_ID, data.request.USER_ID, data.request.USER_PW, data.request.USER_TYPE, data.request.USER_GROUP_CODE];

            sql.RunDML(str2, indata2, function (err) {
                if (err) ReturnSVC(client, data, "88888", err.code);
                else ReturnSVC(client, data, "03100", "");
            });
        }
    });
}

//서비스04: 도서정보 조회
function C_ReadBookList(client, data) {
    var str = '';
    var indata = [];
    if (data.request.CRUD_FLAG != 'R') ReturnSVC(client, data, "99999", "플레그 오류");
    cmnUtil.LogSVC("C_ReadBookList", "도서정보조회. 요청자: " + data.request.JOB_USER_ID);

    //emptystring은 조건 제외 & BOOK_CD값이 오면 단일검색이므로 다른 조건 안봄. 

    if (data.request.BOOK_CD) {
        str = 'SELECT * FROM BOOK ' + setWhereSql('BOOK_CD', data.request.BOOK_CD, indata, true);
        //str = 'SELECT * FROM BOOK WHERE BOOK_CD=? ';
        //indata = [data.request.BOOK_CD];
    } else {
        str = 'SELECT * FROM BOOK '
            + setWhereSql('BOOK_NM', data.request.BOOK_NM, indata, true)
            + setWhereSql('BOOK_SUB_NM', data.request.BOOK_SUB_NM, indata)
            + setWhereSql('BOOK_CLASS', data.request.BOOK_CLASS, indata)
            + setWhereSql('BOOK_ISBN', data.request.BOOK_ISBN, indata)
            + setWhereSql('BOOK_PUB_DATE', data.request.BOOK_PUB_DATE, indata)
            + setWhereSql('BOOK_PUBLISHER', data.request.BOOK_PUBLISHER, indata)
            + setWhereSql('BOOK_AUTHOR', data.request.BOOK_AUTHOR, indata)
            + setWhereSql('RECO_CD', getRecoCD(data.request.RECO_NM), indata);
    }

    //정보 조회
    sql.RunQL(str, indata, function (err, rows) {
        if (err) ReturnSVC(client, data, "88888", 'user: ' + err.code);
        else {
            //있으면 데이터 구성해서 던지자.
            data.response.RSP_NUM = rows.length;
            if (data.response.RSP_NUM == 0) {
                ReturnSVC(client, data, "04101", "result is 0");
            } else {
                console.log(rows[0].BOOK_CD);

                for (var i = 0 ; i < data.response.RSP_NUM ; i++) {

                    data.response.BOOK_CD[i] = rows[i].BOOK_CD || '';
                    data.response.BOOK_NM[i] = rows[i].BOOK_NM || '';
                    data.response.BOOK_SUB_NM[i] = rows[i].BOOK_SUB_NM || '';
                    data.response.BOOK_CLASS[i] = rows[i].BOOK_CLASS || '';
                    data.response.BOOK_ISBN[i] = rows[i].BOOK_ISBN || '';
                    data.response.BOOK_PUB_DATE[i] = rows[i].BOOK_PUB_DATE || '';
                    data.response.BOOK_PUBLISHER[i] = rows[i].BOOK_PUBLISHER || '';
                    data.response.BOOK_AUTHOR[i] = rows[i].BOOK_AUTHOR || '';
                    data.response.BOOK_PATH[i] = rows[i].BOOK_PATH || '';
                    data.response.RECO_NM[i] = rows[i].RECO_NM || '';
                }
                console.log(data.response.BOOK_CD);
                ReturnSVC(client, data, "04100", "");
            }
        }
    });
}
