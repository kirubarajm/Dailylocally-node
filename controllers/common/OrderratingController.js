"use strict";

var Orderrating = require("../../model/common/orderratingModel");

exports.list_all_Orderrating = function(req, res) {
  Orderrating.getAllProduct(function(err, product) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", product);
    res.send(product);
  });
};

exports.createorderrating = function(req, res) {
  var new_rating = new Orderrating(req.body);
  //console.log(order_item);
  //console.log(new_Order);
  //handles null error
  if (!new_rating.orderid) {
    res.status(400).send({ error: true, message: "Please provide orderid" });
  } else {
    Orderrating.createOrderrating(new_rating, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.read_a_Orderrating = function(req, res) {
  Orderrating.getOrderById(req.params.id, function(err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.update_a_Orderrating = function(req, res) {
  Orderrating.updateById(req.params.id, new Orderitems(req.body), function(
    err,
    product
  ) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.delete_a_Orderrating = function(req, res) {
  Orderrating.remove(req.params.id, function(err, product) {
    if (err) res.send(err);
    res.json({ message: "Product successfully deleted" });
  });
};
