"user strict";
var sql = require("../db.js");

//Task object constructor
var packageStock = function(orderpackage) {
  this.makeit_id = orderpackage.makeit_id;
  this.session = orderpackage.session;
  this.stock_count = orderpackage.stock_count || 0;
  this.pid = orderpackage.pid;
};

packageStock.createpackageSession = function createpackageSession(order_package_history) {
    sql.query("INSERT INTO PackagingStocks set ?", order_package_history, function(err,result) {
        if (err) {
            sql.rollback(function() {
                throw err;
            });
        //res(null, err);
        }
    });
};

module.exports = packageStock;