"user strict";
var sql = require("../db.js");


//Task object constructor
var OrderComments = function(ordercomments) {
  this.comments = ordercomments.comments;
  this.Img1 = ordercomments.Img1 || '';
  this.Img2 = ordercomments.Img2  || '';
  this.done_by = ordercomments.done_by ;
  this.type= ordercomments.type;
  this.doid = ordercomments.doid;
  this.done_type = ordercomments.done_type ;
};


OrderComments.create_OrderComments = function create_OrderComments(OrderComments, res) {
  // console.log(OrderComments);
  sql.query("INSERT INTO DayOrderComments set ?", OrderComments, function(err, result) {
    if (err) {
      console.log(err);
      res(err, null);
    } else {
      
     
      let resobj = {
        success: true,
        status : true,
        message: "Day Order Comments Created successfully"
      };
      res(null, resobj);
    }
  });
};

OrderComments.create_OrderComments_crm = function create_OrderComments_crm(OrderComments, res) {
  // console.log(OrderComments);
  sql.query("INSERT INTO DayOrderComments set ?", OrderComments, function(err, result) {
    if (err) {
      console.log(err);
      res(err, null);
    } else {
      
     
      // let resobj = {
      //   success: true,
      //   status : true,
      //   message: "Day Order Comments Created successfully"
      // };
      // res(null, resobj);
    }
  });
};
module.exports = OrderComments;
