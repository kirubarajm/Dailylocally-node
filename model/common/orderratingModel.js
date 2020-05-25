"user strict";
var sql = require("../db.js");

//Task object constructor
var Orderrating = function(orderrating) {
  this.rating_product = orderrating.rating_product;
  this.rating_delivery = orderrating.rating_delivery;
  this.order_package = orderrating.order_package;
  this.product_received = orderrating.product_received;
  this.doid = orderrating.doid;
};

Orderrating.createOrderrating = function createOrderrating(Order_rating,result) {
  sql.query(
    "Select * from day_order_rating where doid = '" + Order_rating.doid + "'",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length === 0) {
          sql.query("INSERT INTO Order_rating set ?", Order_rating, function(
            err,
            res
          ) {
            if (err) {
              result(err, null);
            } else {
              let resobj = {
                success: true,
                status: true,
                message: "Thanks for your Order Rating",
                orid: res.insertId
              };
              result(null, resobj);
            }
          });
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
