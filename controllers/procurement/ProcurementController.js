"use strict";

var Procurement = require("../../model/procurement/procurementModel");



exports.new_procurement_create = function(req, res) {
    Procurement.new_procurement_create(req.body, function(err, user) {
      if (err) res.send(err);
      res.send(user);
    });
  };
  