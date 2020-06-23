"use strict";

var Procurement = require("../../model/procurement/procurementModel");

//// Procurment View //////////////
exports.procurement_view = function(req, res) {
  Procurement.procurement_view(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.new_procurement_create = function(req, res) {
    Procurement.new_procurement_create(req.body, function(err, user) {
      if (err) res.send(err);
      res.send(user);
    });
};

exports.procurement_list = function(req, res) {
  Procurement.procurement_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.move_to_purchase = function(req, res) {
  Procurement.move_to_purchase(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};
  
  