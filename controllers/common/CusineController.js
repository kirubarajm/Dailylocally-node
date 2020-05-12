"use strict";

var Cuisine = require("../../model/common/cusineModel");

exports.list_all_Cuisine = function(req, res) {
  Cuisine.getAllcuisine(function(err, faq) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};

exports.getCuisineByType = function(req, res) {
  Cuisine.getCuisineByType(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.create_a_Cuisine = function(req, res) {
  var new_ques = new Cuisine(req.body);
  console.log(new_ques);
  //handles null error

  Cuisine.createCuisine(new_ques, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_Cuisine = function(req, res) {
  Cuisine.read_a_Cusine_id(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.update_a_Cuisine = function(req, res) {
  Cuisine.updateById(req.params.id, new Faq(req.body), function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.delete_a_Cuisine = function(req, res) {
  Cuisine.remove(req.params.id, function(err, Cuisine) {
    if (err) res.send(err);
    res.json(Cuisine);
  });
};
