"use strict";

var Hometown = require("../../model/common/homedownModel");

exports.list_all_homedown = function(req, res) {
    Hometown.getAllHometown(function(err, faq) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};

exports.getRegionByType = function(req, res) {
    Hometown.getRegionByType(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.create_a_Region = function(req, res) {
  var new_ques = new Hometown(req.body);
  console.log(new_ques);
  //handles null error

  Hometown.createquestions(new_ques, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_region = function(req, res) {
    Hometown.read_a_region_id(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.update_a_Region = function(req, res) {
    Hometown.updateById(req.params.id, new Faq(req.body), function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.delete_a_Region = function(req, res) {
    Hometown.remove(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json({ message: "Faq successfully deleted" });
  });
};

exports.pro_call = function(req, res) {
    Hometown.procall(req, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};
