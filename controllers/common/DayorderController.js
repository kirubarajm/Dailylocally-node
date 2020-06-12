"use strict";

var Dayorder = require("../../model/common/dayorderModel");


exports.day_order_list = function(req, res) {
    Dayorder.day_order_list(req.body, function(err, user) {
      if (err) res.send(err);
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