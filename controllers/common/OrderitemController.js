"use strict";

var Orderitems = require("../../model/common/orderItemsModel.js");

exports.list_all_product = function(req, res) {
  Orderitems.getAllProduct(function(err, product) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", product);
    res.send(product);
  });
};

exports.createOrderitems = function(req, res) {
  var new_Order = new Orderitems(req.body);
  var order_item = req.body.orderitems;
  //console.log(order_item);
  //console.log(new_Order);
  //handles null error
  if (
    !new_Order.userid ||
    !new_Order.price ||
    !new_Order.makeit_user_id ||
    !new_Order.delivery_charge
  ) {
    res
      .status(400)
      .send({
        error: true,
        message: "Please provide userid/price/makeit_user_id/delivery_charge"
      });
  } else {
    Orderitems.createOrderitems(new_Order, order_item, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.read_a_product = function(req, res) {
  Orderitems.getOrderById(req.params.id, function(err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.update_a_product = function(req, res) {
  Orderitems.updateById(req.params.id, new Orderitems(req.body), function(
    err,
    product
  ) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.delete_a_product = function(req, res) {
  Orderitems.remove(req.params.id, function(err, product) {
    if (err) res.send(err);
    res.json({ message: "Product successfully deleted" });
  });
};

exports.createOrderitemsonline = function(req, res) {
  var order_item = new Orderitems(req.body);
  if (!order_item.orderid) {
    res.status(400).send({ error: true, message: "Please provide orderid" });
  } else {
    Orderitems.createOrderitemsonline(order_item, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};
