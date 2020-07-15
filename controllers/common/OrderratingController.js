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
  

  if (!req.body.doid) {
    res.status(400).send({ error: true, message: "Please provide day doid" });
  } else {
    Orderrating.createOrderrating(req.body, function(err, result) {
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

exports.day_order_rating_check = function(req, res) {
  Orderrating.day_order_rating_check(req.body, function(err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};