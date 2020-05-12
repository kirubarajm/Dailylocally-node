"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeitdaywise = function(makeitdaywise) {
  this.date         = makeitdaywise.log_date;
  this.makeit_id    = makeitdaywise.makeit_id;
  this.cycle1       = makeitdaywise.cycle1;
  this.cycle2       = makeitdaywise.cycle2;
  this.cycle3       = makeitdaywise.cycle3;
  this.logtime      = makeitdaywise.logtime;
  this.order_count  = makeitdaywise.order_count;
  this.breakfast_completed = makeitdaywise.breakfast_completed;
  this.lunch_completed     = makeitdaywise.lunch_completed;
  this.dinner_completed    = makeitdaywise.dinner_completed; 
  this.breakfast_canceled  = makeitdaywise.breakfast_canceled;
  this.lunch_canceled      = makeitdaywise.lunch_canceled;
  this.dinner_canceled     = makeitdaywise.dinner_canceled; 
  this.cycle_count      = makeitdaywise.cycle_count; 
  this.breakfast_count  = makeitdaywise.breakfast_count;
  this.lunch_count      = makeitdaywise.lunch_count;
  this.dinner_count     = makeitdaywise.dinner_count; 
  this.total_makeit_earnings = makeitdaywise.total_makeit_earnings;
  this.breakfast_total_makeit_earnings = makeitdaywise.breakfast_total_makeit_earnings;
  this.lunch_total_makeit_earnings = makeitdaywise.lunch_total_makeit_earnings;
  this.dinner_total_makeit_earnings = makeitdaywise.dinner_total_makeit_earnings;
  this.complete_succession_count = makeitdaywise.complete_succession_count;
  this.cancel_order_count = makeitdaywise.cancel_order_count;
  this.kitchen_percentage = makeitdaywise.kitchen_percentage;

  this.log0809 = makeitdaywise.log0809;
  this.log0910 = makeitdaywise.log0910;
  this.log1011 = makeitdaywise.log1011;
  this.log1112 = makeitdaywise.log1112;
  this.log1213 = makeitdaywise.log1213;
  this.log1314 = makeitdaywise.log1314;
  this.log1415 = makeitdaywise.log1415;
  this.log1516 = makeitdaywise.log1516;
  this.log1617 = makeitdaywise.log1617;
  this.log1718 = makeitdaywise.log1718;
  this.log1819 = makeitdaywise.log1819;
  this.log1920 = makeitdaywise.log1920;
  this.log2021 = makeitdaywise.log2021;
  this.log2122 = makeitdaywise.log2122;
  this.log2223 = makeitdaywise.log2223;

  this.log0809_count = makeitdaywise.log0809_count;
  this.log0910_count = makeitdaywise.log0910_count;
  this.log1011_count = makeitdaywise.log1011_count;
  this.log1112_count = makeitdaywise.log1112_count;
  this.log1213_count = makeitdaywise.log1213_count;
  this.log1314_count = makeitdaywise.log1314_count;
  this.log1415_count = makeitdaywise.log1415_count;
  this.log1516_count = makeitdaywise.log1516_count;
  this.log1617_count = makeitdaywise.log1617_count;
  this.log1718_count = makeitdaywise.log1718_count;
  this.log1819_count = makeitdaywise.log1819_count;
  this.log1920_count = makeitdaywise.log1920_count;
  this.log2021_count = makeitdaywise.log2021_count;
  this.log2122_count = makeitdaywise.log2122_count;
  this.log2223_count = makeitdaywise.log2223_count;

  this.log0809_completed = makeitdaywise.log0809_completed;
  this.log0910_completed = makeitdaywise.log0910_completed;
  this.log1011_completed = makeitdaywise.log1011_completed;
  this.log1112_completed = makeitdaywise.log1112_completed;
  this.log1213_completed = makeitdaywise.log1213_completed;
  this.log1314_completed = makeitdaywise.log1314_completed;
  this.log1415_completed = makeitdaywise.log1415_completed;
  this.log1516_completed = makeitdaywise.log1516_completed;
  this.log1617_completed = makeitdaywise.log1617_completed;
  this.log1718_completed = makeitdaywise.log1718_completed;
  this.log1819_completed = makeitdaywise.log1819_completed;
  this.log1920_completed = makeitdaywise.log1920_completed;
  this.log2021_completed = makeitdaywise.log2021_completed;
  this.log2122_completed = makeitdaywise.log2122_completed;
  this.log2223_completed = makeitdaywise.log2223_completed;

  this.log0809_canceled = makeitdaywise.log0809_canceled;
  this.log0910_canceled = makeitdaywise.log0910_canceled;
  this.log1011_canceled = makeitdaywise.log1011_canceled;
  this.log1112_canceled = makeitdaywise.log1112_canceled;
  this.log1213_canceled = makeitdaywise.log1213_canceled;
  this.log1314_canceled = makeitdaywise.log1314_canceled;
  this.log1415_canceled = makeitdaywise.log1415_canceled;
  this.log1516_canceled = makeitdaywise.log1516_canceled;
  this.log1617_canceled = makeitdaywise.log1617_canceled;
  this.log1718_canceled = makeitdaywise.log1718_canceled;
  this.log1819_canceled = makeitdaywise.log1819_canceled;
  this.log1920_canceled = makeitdaywise.log1920_canceled;
  this.log2021_canceled = makeitdaywise.log2021_canceled;
  this.log2122_canceled = makeitdaywise.log2122_canceled;
  this.log2223_canceled = makeitdaywise.log2223_canceled;

};

Makeitdaywise.createmakeitdaywise = function createmakeitdaywise(req,result) {

  //console.log("report------------------>",req);
  sql.query("INSERT INTO Makeit_daywise_report  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Makeit daywise created successfully"
      };
      //result(null, resobj);
    }
  });  
};

module.exports = Makeitdaywise;