"use strict";

var Collection = require("../../model/common/collectionModel");

exports.list_all_collection = function(req, res) {
    Collection.list_all_active_collection(req.body,function(err, result) {
    //console.log("controller");
    if (err) res.send(err);
    //console.log("res", result);
    res.send(result);
  });
};


exports.get_all_collection_by_cid_v2= function(req, res) {
  Collection.get_all_collection_by_cid_v2(req.body, function(err, result) {
  if (err) res.send(err);
  res.json(result);
});
};



