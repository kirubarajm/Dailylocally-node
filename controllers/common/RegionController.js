"use strict";

var Region = require("../../model/common/regionModel");

exports.list_all_region = function(req, res) {
  Region.getAllregion(function(err, faq) {
    if (err) res.send(err);
    res.send(faq);
  });
};

exports.getRegionByType = function(req, res) {
  Region.getRegionByType(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.create_a_Region = function(req, res) {
  var new_Region = new Region(req.body);
  //handles null error

  Region.createRegion(new_Region, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.create_a_radius_limit= function(req, res) {
  //handles null error

  Region.create_a_radius_limit_by_admin(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_question = function(req, res) {
  Region.read_a_region_id(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.update_a_Region = function(req, res) {
  Region.updateById(req.params.id, new Faq(req.body), function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.delete_a_Region = function(req, res) {
  Region.remove(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json({ message: "Faq successfully deleted" });
  });
};

exports.pro_call = function(req, res) {
  Region.procall(req, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.search_a_search_region = function(req, res) {
  Region.search_a_search_region(req.body, function(err, result) {
    if (err) res.send(err);
    res.send(result);
  });
};
