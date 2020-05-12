"user strict";
var sql = require("../db.js");

//Task object constructor
var Orderrating = function(orderrating) {
  this.rating_food = orderrating.rating_food;
  this.rating_delivery = orderrating.rating_delivery;
  this.desc_food = orderrating.desc_food;
  this.desc_delivery = orderrating.desc_delivery;
  this.orderid = orderrating.orderid;
};

Orderrating.createOrderrating = function createOrderrating(Order_rating,result) {
  sql.query(
    "Select * from Order_rating where orderid = '" + Order_rating.orderid + "'",
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

Orderrating.getOrderById = function getOrderById(orderid, result) {
  sql.query("Select * from Order_rating where orderid = ? ", orderid, function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Orderrating.getAllOrder = function getAllOrder(result) {
  sql.query("Select * from Order_rating", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Orderrating.updateById = function(id, user, result) {
 
  sql.query(
    "UPDATE Order_rating SET moveit_user_id = ? WHERE orderid = ?",
    [id, id],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Orderrating.remove = function(id, result) {
  sql.query("DELETE FROM Order_rating WHERE orderid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
module.exports = Orderrating;
