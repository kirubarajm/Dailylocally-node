"use strict";

var sub_category_L1 = require("../../model/category/subcategoryL1Model");



exports.get_Sub_Category_L1_list = function(req, res) {
    if (!req.body.lat) {
      res
        .status(400)
        .send({ error: true, status: false, message: "Please provide lat" });
    } else if (!req.body.lon) {
      res
        .status(400)
        .send({ error: true, status: false, message: "Please provide lan" });
    }else if (!req.body.userid) {
      res
        .status(400)
        .send({ error: true, status: false, message: "Please provide userid" });
    } else {
        sub_category_L1.get_Sub_Category_L1_list(req.body, function(err, user) {
        //console.log("Kitchen List Sort Filter v_2_2 controller");
        if (err) res.send(err);
        //console.log("res", user);
        res.send(user);
      });
    }
  };