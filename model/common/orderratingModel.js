"user strict";
var sql = require("../db.js");

//Task object constructor
var Orderrating = function(orderrating) {
  this.rating_product = orderrating.rating_product;
  this.rating_delivery = orderrating.rating_delivery;
  this.order_package = orderrating.order_package;
  this.product_received = orderrating.product_received ||'';
  this.doid = orderrating.doid;
  this.vpid = orderrating.vpid;
  this.comments = orderrating.comments;
};

Orderrating.createOrderrating = function createOrderrating(Order_rating,new_vpid,result) {
  sql.query(
    "Select * from day_order_rating where doid = '" + Order_rating.doid + "'",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length === 0) {

          for (let i = 0; i < new_vpid.length; i++) {

            var new_rating = new Orderrating(Order_rating);
            new_rating.vpid=new_vpid[i];
    
            sql.query("INSERT INTO day_order_rating set ?", new_rating, function(err,res) {
              if (err) {
                result(err, null);
              } else {

          
                let resobj = {
                  success: true,
                  status: true,
                  message: "Thanks for your Order Rating"
                };
                result(null, resobj);
              }
            });
            
          }
         
        } else {
          let resobj = {
            success: true,
            status: false,
            message:  "Already order rating completed",
            result: res
          };
          result(null, resobj);
        }
      }
    }
  );
};


module.exports = Orderrating;
