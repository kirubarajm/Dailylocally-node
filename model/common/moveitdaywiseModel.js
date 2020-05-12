"user strict";
var sql = require("../db.js");

//Task object constructor
var Moveitdaywise = function(moveitdaywise) {
  this.date         = moveitdaywise.date;
  this.moveit_userid = moveitdaywise.moveit_userid;
  this.cycle1       = moveitdaywise.cycle1;
  this.cycle2       = moveitdaywise.cycle2;
  this.cycle3       = moveitdaywise.cycle3;
  this.logtime      = moveitdaywise.logtime;
  this.order_count  = moveitdaywise.order_count;
  this.breakfast    = moveitdaywise.breakfast;
  this.lunch        = moveitdaywise.lunch;
  this.dinner       = moveitdaywise.dinner;
  
  this.log0809 = moveitdaywise.log0809;
  this.log0910 = moveitdaywise.log0910;
  this.log1011 = moveitdaywise.log1011;
  this.log1112 = moveitdaywise.log1112;
  this.log1213 = moveitdaywise.log1213;
  this.log1314 = moveitdaywise.log1314;
  this.log1415 = moveitdaywise.log1415;
  this.log1516 = moveitdaywise.log1516;
  this.log1617 = moveitdaywise.log1617;
  this.log1718 = moveitdaywise.log1718;
  this.log1819 = moveitdaywise.log1819;
  this.log1920 = moveitdaywise.log1920;
  this.log2021 = moveitdaywise.log2021;
  this.log2122 = moveitdaywise.log2122;
  this.log2223 = moveitdaywise.log2223;

  this.log0809_count = moveitdaywise.log0809_count;
  this.log0910_count = moveitdaywise.log0910_count;
  this.log1011_count = moveitdaywise.log1011_count;
  this.log1112_count = moveitdaywise.log1112_count;
  this.log1213_count = moveitdaywise.log1213_count;
  this.log1314_count = moveitdaywise.log1314_count;
  this.log1415_count = moveitdaywise.log1415_count;
  this.log1516_count = moveitdaywise.log1516_count;
  this.log1617_count = moveitdaywise.log1617_count;
  this.log1718_count = moveitdaywise.log1718_count;
  this.log1819_count = moveitdaywise.log1819_count;
  this.log1920_count = moveitdaywise.log1920_count;
  this.log2021_count = moveitdaywise.log2021_count;
  this.log2122_count = moveitdaywise.log2122_count;
  this.log2223_count = moveitdaywise.log2223_count;

  this.busy_0809 = moveitdaywise.busy_0809;
  this.busy_0910 = moveitdaywise.busy_0910;
  this.busy_1011 = moveitdaywise.busy_1011;
  this.busy_1112 = moveitdaywise.busy_1112;
  this.busy_1213 = moveitdaywise.busy_1213;
  this.busy_1314 = moveitdaywise.busy_1314;
  this.busy_1415 = moveitdaywise.busy_1415;
  this.busy_1516 = moveitdaywise.busy_1516;
  this.busy_1617 = moveitdaywise.busy_1617;
  this.busy_1718 = moveitdaywise.busy_1718;
  this.busy_1819 = moveitdaywise.busy_1819;
  this.busy_1920 = moveitdaywise.busy_1920;
  this.busy_2021 = moveitdaywise.busy_2021;
  this.busy_2122 = moveitdaywise.busy_2122;
  this.busy_2223 = moveitdaywise.busy_2223;
};

Moveitdaywise.createmoveitdaywise = function createmoveitdaywise(req) {
  sql.query("INSERT INTO Moveit_daywise_report  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Moveit daywise created successfully"
      };
      //result(null, resobj);
    }
  });
};


module.exports = Moveitdaywise;