"user strict";
var sql = require("../db.js");

//Task object constructor
var orderpackagehistory = function(orderpackage) {
  this.orderid        = orderpackage.orderid;
  this.product_id = orderpackage.product_id;
  this.makeit_id = orderpackage.makeit_id;
  this.count = orderpackage.count || 0;
  this.package_id = orderpackage.package_id;
};

orderpackagehistory.createorderpackage = function createorderpackage(order_package_history,res) {
    sql.query("INSERT INTO Orders_Packaging set ?", order_package_history, function(err,result) {
        if (err) {
            sql.rollback(function() {
                throw err;
            });
        //res(null, err);
        }
    });
};

module.exports = orderpackagehistory;