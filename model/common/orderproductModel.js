"user strict";
var sql = require("../db.js");


//Task object constructor
var orderproductModel = function(orderproductModel) {
  this.vpid = orderproductModel.vpid;
  this.orderid = orderproductModel.orderid;
  this.productname = orderproductModel.productname;
  this.quantity = orderproductModel.quantity;
  this.price = orderproductModel.price;
  this.deliverydate = orderproductModel.deliverydate;
  this.starting_date = orderproductModel.starting_date;
  this.no_of_deliveries = orderproductModel.no_of_deliveries;
  this.subscription = orderproductModel.subscription;
  this.mon = orderproductModel.mon ||0 ;
  this.tue = orderproductModel.tue ||0 ;
  this.wed = orderproductModel.wed ||0 ;
  this.thur = orderproductModel.thur ||0 ;
  this.fri = orderproductModel.fri ||0 ;
  this.sat = orderproductModel.sat ||0 ;
  this.sun = orderproductModel.sun ||0 ;
  this.status= orderproductModel.status ||0 ;

};

orderproductModel.createOrderitems = function createOrderitems(order_item, res) {

  

  sql.query("INSERT INTO Orderproducts set ?", order_item, function(err, result) {
    if (err) {
      res(err, null);
    } else {
      var OrderItemid = result.insertId;
     
      let resobj = {
        success: true,
        message: "Order Item Created successfully",
        OrderItemid: OrderItemid
      };
      res(null, resobj);
    }
  });
};





module.exports = orderproductModel;
