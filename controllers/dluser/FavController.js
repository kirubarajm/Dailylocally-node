"use strict";

var Fav = require("../../model/dluser/favModel.js");

exports.create_a_fav = function(req, res) {
  var new_fav = new Fav(req.body);

  //handles null error
  if (!new_fav.userid) {
    res.status(400).send({ error: true, message: "Please provide userid" });
  } else {
    Fav.createFav(new_fav, function(err, fav) {
      if (err) res.send(err);
      res.json(fav);
    });
  }
};

exports.delete_a_fav = function(req, res) {

  if (!req.params.id) {
    res.status(400).send({ error: true, message: "Please provide fav id" });
  } else {
    Fav.remove(req.params.id, function(err, fav) {
      if (err) res.send(err);
      res.json(fav);
    });
  }
};


exports.read_a_product_by_userid = function(req, res) {
  Fav.read_a_product_by_userid(req.body, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};

exports.read_a_subcategoryL1_by_userid = function(req, res) {
  Fav.read_a_subcategoryL1_by_userid(req.body, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};


exports.read_category_by_userid = function(req, res) {
  Fav.read_a_category_by_userid(req.body, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};
