"use strict";

var Dayorder = require("../../model/common/dayorderModel");

///// Day Order List ///////////
exports.day_order_list = function(req, res) {
  Dayorder.day_order_list(req.body, function(err, user) {
    //console.log("day_order_list controller");
    if (err) res.send(err);
    //console.log("res", ress);
    res.send(user);
  });
};

///// Day Order View ///////////
exports.day_order_view = function(req, res) {
  Dayorder.day_order_view(req.body, function(err, user) {
    //console.log("day_order_view controller");
    if (err) res.send(err);
    //console.log("res", ress);
    res.send(user);
  });
};

exports.quality_day_order_list = function(req, res) {
  Dayorder.quality_day_order_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.quality_day_order_view = function(req, res) {
  Dayorder.quality_day_order_view(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.day_order_product_cancel = function(req, res) {
  Dayorder.day_order_product_cancel(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};
 

exports.crm_day_order_list = function(req, res) {
  Dayorder.crm_day_order_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};