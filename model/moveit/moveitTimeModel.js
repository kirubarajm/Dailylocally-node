'user strict';
var sql     = require('../db.js');
var request = require("request");
var Constant  = require("../constant")
const util  = require("util");
const query = util.promisify(sql.query).bind(sql);
let jwt     = require('jsonwebtoken');
let config  = require('../config.js');
var constant  = require('../constant.js');
var moment  = require("moment");

//Task object constructor
var MoveitTimelog = function (moveittimelog) {
    this.logtime  = moveittimelog.logtime || moment().format("YYYY-MM-DD HH:mm:ss");
    this.type     = moveittimelog.type || 0;
    this.lat      = moveittimelog.lat;
    this.lon      = moveittimelog.lon;
    this.moveit_userid = moveittimelog.moveit_userid;
    this.action   = moveittimelog.action;
    this.created_at = moveittimelog.created_at || moment().format("YYYY-MM-DD HH:mm:ss");   
    this.logtime  = moveittimelog.logtime || moment().format("YYYY-MM-DD HH:mm:ss");
};

MoveitTimelog.createMoveitTimelog = async function createMoveitTimelog(newMoveitTimelog, result) {
  var Moveittimelog= await query("select * from Moveit_Timelog where moveit_userid="+newMoveitTimelog.moveit_userid+" and date(created_at)=CURDATE() order by mt_id desc limit 1");

  if(newMoveitTimelog.type==1){
    if(Moveittimelog.length==0 && newMoveitTimelog.type==1){
      sql.query("INSERT INTO Moveit_Timelog set ?", newMoveitTimelog, function (err, res1) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          let resobj = {
            success: true,
            status : true,
            message: 'Moveit Timelog in created successfully',
            id: res1.insertId
          };
          result(null, resobj);
        }
      }); 
    }else if(Moveittimelog.length!=0 && (Moveittimelog[0].type ==0 && newMoveitTimelog.type ==1)){
      sql.query("INSERT INTO Moveit_Timelog set ?", newMoveitTimelog, function (err, res1) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          let resobj = {
            success: true,
            status : true,
            message: 'Moveit Timelog in created successfully',
            id: res1.insertId
          };
          result(null, resobj);
        }
      });
    }else{
      console.log("default else");
    }

  }else{
    sql.query("INSERT INTO Moveit_Timelog set ?", newMoveitTimelog, function (err, res1) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let resobj = {
          success: true,
          status : true,
          message: 'Moveit Timelog out created successfully',
          id: res1.insertId
        };
        result(null, resobj);
      }
    }); 
  }
};

module.exports = MoveitTimelog;