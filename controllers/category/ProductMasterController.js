"use strict";

var ProductMaster = require("../../model/category/productmasterModel");



exports.get_ProductMaster_list = function(req, res) {
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
        ProductMaster.get_ProductMaster_list(req.body, function(err, user) {
        if (err) res.send(err);
        res.send(user);
      });
    }
  };

  exports.get_Product_detail = function(req, res) {
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
        ProductMaster.get_product_details(req.body, function(err, user) {
        if (err) res.send(err);
        res.send(user);
      });
    }
  };

  exports.get_order_Product_detail = function(req, res) {
        ProductMaster.get_order_product_details(req.body, function(err, user) {
        if (err) res.send(err);
        res.send(user);
      });

  };

  exports.get_collection_product_list = function(req, res) {
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
        ProductMaster.get_collection_product_list(req.body, function(err, user) {
        //console.log("Kitchen List Sort Filter v_2_2 controller");
        if (err) res.send(err);
        //console.log("res", user);
        res.send(user);
      });
    }
  };

  exports.get_collection_subcategoryL1 = function(req, res) {
  
        ProductMaster.get_collection_product_list(req.body, function(err, user) {
        //console.log("Kitchen List Sort Filter v_2_2 controller");
        if (err) res.send(err);
        //console.log("res", user);
        res.send(user);
      });
  
  };

  exports.get_brand_list = function(req, res) {
        ProductMaster.get_brand_list(req.params, function(err, user) {
        //console.log("Kitchen List Sort Filter v_2_2 controller");
        if (err) res.send(err);
        //console.log("res", user);
        res.send(user);
      });
    
  };

  exports.get_sort_list = function(req, res) {
    ProductMaster.get_sort_list(req.params, function(err, user) {
    //console.log("Kitchen List Sort Filter v_2_2 controller");
    if (err) res.send(err);
    //console.log("res", user);
    res.send(user);
  });

};