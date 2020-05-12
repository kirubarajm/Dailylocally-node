"use strict";

var Fav = require("../../model/dluser/favModel.js");

exports.list_all_fav = function(req, res) {
  Fav.getAllFav(function(err, fav) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", fav);
    res.send(fav);
  });
};

exports.list_all_fav_eatusers = function(req, res) {
  Fav.getAllFavByEatUser(req.params.id, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};

exports.create_a_fav = function(req, res) {
  var new_fav = new Fav(req.body);
  console.log(new_fav);
  //handles null error
  if (!new_fav.eatuserid) {
    res.status(400).send({ error: true, message: "Please provide eatuserid" });
  } else {
    Fav.createFav(new_fav, function(err, fav) {
      if (err) res.send(err);
      res.json(fav);
    });
  }
};

exports.read_a_fav = function(req, res) {
  Fav.getFavById(req.params.id, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};

exports.update_a_fav = function(req, res) {
  Fav.updateById(req.params.id, new Fav(req.body), function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};

exports.delete_a_fav = function(req, res) {
  console.log(req.params.id);
  if (!req.params.id) {
    res.status(400).send({ error: true, message: "Please provide fav id" });
  } else {
    Fav.remove(req.params.id, function(err, fav) {
      if (err) res.send(err);
      res.json(fav);
    });
  }
};

exports.read_a_fav_dishlist = function(req, res) {
  Fav.read_a_dishlist_byeatuserid(req.params.id, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};

exports.read_a_fav_dishlist_v2 = function(req, res) {
  Fav.read_a_dishlist_byeatuserid_v2(req.params.id, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};

exports.read_a_fav_kitchenlist = function(req, res) {
  Fav.read_a_fav_kitchenlist_byeatuserid(req.params.id, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};

exports.read_a_fav_kitchenlist_v2 = function(req, res) {
  Fav.read_a_fav_kitchenlist_byeatuserid_v2(req.params.id, function(err, fav) {
    if (err) res.send(err);
    res.json(fav);
  });
};

