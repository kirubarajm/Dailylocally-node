"user strict";
var sql = require("../db.js");

//Task object constructor
var Orderlock = function(orderlock) {
  this.orderid = orderlock.orderid;
  this.productid = orderlock.productid;
  this.quantity = orderlock.quantity;
};

Orderlock.lockOrderitems = function lockOrderitems(order_item, res) {

  sql.query("INSERT INTO Lock_order set ?", order_item, function(err, result) {
    if (err) {
      res(err, null);
    } else {
      var orderlockid = result.insertId;
      let resobj = {
        success: true,
        orderlockid: orderlockid
      };
      res(null, resobj);
    }
  });
};

module.exports = Orderlock;
