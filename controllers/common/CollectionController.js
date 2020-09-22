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

/////Collection classification List/////////// 
exports.get_classification_list= function(req, res) {
  Collection.get_classification_list(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////Collection classification Filter/////////// 
exports.classificationfilter= function(req, res) {
  Collection.classificationfilter(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////Collection Add/////////// 
exports.collection_add= function(req, res) {
  Collection.collection_add(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////Collection View/////////// 
exports.collection_view= function(req, res) {
  Collection.collection_view(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////Collection edit/////////// 
exports.collection_edit= function(req, res) {
  Collection.collection_edit(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////Collection List/////////// 
exports.collection_list= function(req, res) {
  Collection.collection_list(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};