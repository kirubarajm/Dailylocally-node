"use strict";

var Category = require("../../model/category/categoryModel");



exports.get_category_list = function(req, res) {
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
        Category.get_category_list(req.body, function(err, user) {
        //console.log("Kitchen List Sort Filter v_2_2 controller");
        if (err) res.send(err);
        //console.log("res", user);
        res.send(user);
      });
    }
  };

  exports.read_a_cartdetails = function(req, res) {
    var orderitems = req.body.orderitems;
    var subscription = req.body.subscription;
   if (!req.body.lat) {
      res
        .status(400)
        .send({ error: true, status: false, message: "Please provide lat" });
    } else if (!req.body.lon) {
      res
        .status(400)
        .send({ error: true, status: false, message: "Please provide lan" });
    }else {
      Category.read_a_cartdetails(req.body, orderitems,subscription,function(err,user) {
        if (err) res.send(err);
        res.json(user);
      });
    }
  };