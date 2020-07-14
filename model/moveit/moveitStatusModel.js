'user strict';
var sql = require('../db.js');
var request = require("request");
var Constant =require("../constant")
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var constant = require('../constant.js');
var moment = require("moment");


//Task object constructor
var MoveitStatus = function (moveitstatus) {
    this.orderid = moveitstatus.orderid ;
    this.moveitid = moveitstatus.moveitid;
    this.status = moveitstatus.status || 1;
  //  this.created_at = new Date();   
};

MoveitStatus.createMoveitStatus = function createMoveitStatus(createMoveitStatus, result) {

    //newMoveitTimelog.logtime = moment().format("YYYY-MM-DD HH:mm:ss");
sql.query("INSERT INTO Moveit_status set ?", createMoveitStatus, function (err, res1) {
        if (err) {
        console.log("error: ", err);
        result(err, null);
        } else {
             let resobj = {
            success: true,
            status : true,
            message: 'Moveit status created successfully',
            id: res1.insertId
            };

            result(null, resobj);

    }
});
   
};

module.exports = MoveitStatus;