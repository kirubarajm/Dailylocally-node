"user strict";
var sql = require("../db.js");

//Task object constructor
var Makeittotalrevenue = function(makeittotalrevenue) {
  this.makeit_id    = makeittotalrevenue.makeit_id;
  this.expected_revenue   = makeittotalrevenue.expected_revenue ||0;
  this.total_makeit_earnings   = makeittotalrevenue.total_makeit_earnings||0;
  this.status   = makeittotalrevenue.status;
  this.total_lost_revenue=makeittotalrevenue.total_lost_revenue;
  this.logtime=makeittotalrevenue.logtime;

};

Makeittotalrevenue.createMakeittotalrevenue = function createMakeittotalrevenue(req,result) {

  //console.log("Makeit_total_revenue------------------>",req);
  sql.query("INSERT INTO Makeit_total_revenue  set ?", req, function(err, res) {
    if (err) {
      //result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Makeit total revenue created successfully"
      };
      //result(null, resobj);
    }
  });  
};




module.exports = Makeittotalrevenue;