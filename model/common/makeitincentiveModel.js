"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeitincentive = function(makeitincentive) {
  this.eligibility       = makeitincentive.eligibility;
  this.makeit_id         = makeitincentive.makeit_id;
  this.complete_succession_count  = makeitincentive.complete_succession_count;
  this.cancel_count      = makeitincentive.cancel_count;
  this.incentive_amount  = makeitincentive.incentive_amount;
  this.from_date         = makeitincentive.from_date;
  this.to_date           = makeitincentive.to_date;
};

Makeitincentive.createmakeitincentive = function createmakeitincentive(req) {
  sql.query("INSERT INTO Makeit_incentive  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "makeit incentive created successfully"
      };
      //result(null, resobj);
    }
  });
};


module.exports = Makeitincentive;