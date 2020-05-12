"user strict";
var sql = require("../db.js");
var Product = require("../../model/makeit/productModel.js");

//Task object constructor
var Orderitems = function(orderitems) {
  this.productid = orderitems.productid;
  this.quantity = orderitems.quantity;
  this.gst = orderitems.gst || 0;
  // this.created_at = new Date();
  this.price = orderitems.price || 0;
  this.original_price=orderitems.original_price||0;
  this.orderid = orderitems.orderid;
};

Orderitems.createOrderitems = function createOrderitems(order_item,payment_type, res) {
  sql.query("INSERT INTO OrderItem set ?", order_item, function(err, result) {
    if (err) {
      res(err, null);
    } else {
      var OrderItemid = result.insertId;
      if (payment_type !== 3) {
        
        console.log(order_item.payment_type);
        sql.query("update Product set quantity= quantity-? WHERE productid = ?",[order_item.quantity, order_item.productid],function(err, res1) {
          if (err) {
            res(err, null);
            return;
          }
        }
      );
      }
      
      let resobj = {
        success: true,
        message: "Order Item Created successfully",
        OrderItemid: OrderItemid
      };
      res(null, resobj);
    }
  });
};

Orderitems.createOrderitemsonline = function createOrderitemsonline(order_item,res) {
  sql.query("INSERT INTO OrderItem set ?", order_item, function(err, result) {
    if (err) {
      res(err, null);
    } else {
      var OrderItemid = result.insertId;
      sql.query(
        "update Product set quantity= quantity-? WHERE productid = ?",
        [order_item.quantity, order_item.productid],
        function(err, res1) {
          if (err) {
            res(err, null);
          }
        }
      );
      let resobj = {
        success: true,
        message: "Order Item Created successfully",
        OrderItemid: OrderItemid
      };

      res(null, resobj);
    }
  });
};

Orderitems.getOrderById = function getOrderById(orderid, result) {
  sql.query("Select * from OrderItem where orderid = ? ", orderid, function(
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

Orderitems.getAllOrder = function getAllOrder(result) {
  sql.query("Select * from OrderItem", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Orderitems.updateById = function(id, user, result) {
  sql.query(
    "UPDATE OrderItem SET moveit_user_id = ? WHERE orderid = ?",
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

Orderitems.remove = function(id, result) {
  sql.query("DELETE FROM OrderItem WHERE orderid = ?", [id], function(
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


Orderitems.createOrderitems_by_tunnel = function createOrderitems_by_tunnel(order_item, res) {
  sql.query("INSERT INTO OrderItem set ?", order_item, function(err, result) {
    if (err) {
      res(err, null);
    } else {
      
     
      let resobj = {
        success: true,
        sttus : true,
        message: "Order Item Created successfully"
      };
      res(null, resobj);
    }
  });
};

module.exports = Orderitems;
