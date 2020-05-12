"user strict";
var sql = require("../db.js");
var orderstatushistory = require("../../model/common/orderstatushistoryModel.js");

//Task object constructor
var orderstatushistory = function(orderstatushistory) {
  this.orderid        = orderstatushistory.orderid;
  this.orderstatus    = orderstatushistory.orderstatus;
};

orderstatushistory.createorderstatushistory = function createorderstatushistory(order_status_history,res) {
    console.log(order_status_history);
    sql.query("INSERT INTO Order_status_history set ?", order_status_history, function(err,result) {
        if (err) {
            sql.rollback(function() {
                throw err;
            });
        //res(null, err);
        }
    });
};

module.exports = orderstatushistory;