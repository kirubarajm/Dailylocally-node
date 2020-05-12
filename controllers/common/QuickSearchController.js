"use strict";

var QuickSearch = require("../../model/common/quicksearchModel");

exports.eat_explore_store_data = function(req, res) {
    QuickSearch.eat_explore_store_data_by_cron(req.params, function(err, user) {
      console.log("controller");
      if (err) res.send(err);
      console.log("res", user);
      res.send(user);
    });
  };
  
  
  exports.eat_explore_quick_search = function(req, res) {
    //console.log(req.body);
    QuickSearch.eat_explore_quick_search(req.body, function(err, user) {
      console.log("controller");
      if (err) res.send(err);
      console.log("res", user);
      res.send(user);
    });
  };


  exports.manual_product_unlive = function(req, res) {
    QuickSearch.manual_product_unlive(req.params, function(err, user) {
      console.log("controller");
      if (err) res.send(err);
      console.log("res", user);
      res.send(user);
    });
  };