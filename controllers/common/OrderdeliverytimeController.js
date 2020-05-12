"use strict";

var OrderDeliveryTime = require("../../model/common/orderdeliverytimeModel");

exports.create_a_OrderDeliveryTime = function(req, res) {
  var new_OrderDeliveryTime = new OrderDeliveryTime(req.body);
  OrderDeliveryTime.createOrderDeliveryTime(new_OrderDeliveryTime, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};