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
var MoveitUnassignHistory = function (moveitunassignhistory) {
    this.moveit_userid  = moveitunassignhistory.moveit_userid;
    this.to_moveit_userid  = moveitunassignhistory.to_moveit_userid;
    this.trip_id        = moveitunassignhistory.trip_id;
    this.orderid        = moveitunassignhistory.orderid;
    this.orderstatus    = moveitunassignhistory.orderstatus;
    this.to_orderstatus = moveitunassignhistory.to_orderstatus;
    this.reson          = moveitunassignhistory.reson;
};

MoveitUnassignHistory.createMoveitUnassign = async function createMoveitUnassign(newMoveitUnassign) {
  console.log("createMoveitUnassign");
  sql.query("INSERT INTO Moveit_Unassign_History set ?", newMoveitUnassign, function (err, res1) {
      if (err) {
        console.log("error: ", err);
        //result(err, null);
      } else {
        let resobj = {
          success: true,
          status : true,
          message: 'Moveit unassign log created successfully',
          id: res1.insertId
        };
        //result(null, resobj);
      }
    }); 
  
};

module.exports = MoveitUnassignHistory;