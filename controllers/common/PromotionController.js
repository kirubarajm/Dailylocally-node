"use strict";

var Promotion = require("../../model/common/promotionModel");

exports.list_all_Promotion_by_activestatus = function(req, res) {
    Promotion.getAllPromotion_by_activstatus(req.params.activestatus,function(err, result) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", result);
    res.send(result);
  });
};

exports.get_all_Promotion_by_userid = function(req, res) {
    Promotion.get_Promotion_by_userid(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  };