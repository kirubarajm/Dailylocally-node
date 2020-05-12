"use strict";

var Locality = require("../../model/common/localitiesModel.js");

exports.list_all_locality = function(req, res) {
  Locality.getAllLocality(function(err, locality) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", locality);
    res.send(locality);
  });
};

exports.create_a_locality = function(req, res) {
  var new_locality = new Locality(req.body);
  //handles null error
  if (!new_locality.localityname) {
    res
      .status(400)
      .send({ error: true, message: "Please provide locality name" });
  } else {
    Locality.createLocality(new_locality, function(err, locality) {
      if (err) res.send(err);
      res.json(locality);
    });
  }
};

exports.read_a_locality = function(req, res) {
  Locality.getLocalityById(req.params.id, function(err, locality) {
    if (err) res.send(err);
    res.json(locality);
  });
};

exports.update_a_locality = function(req, res) {
  Locality.updateById(req.params.id, new Locality(req.body), function(
    err,
    locality
  ) {
    if (err) res.send(err);
    res.json(locality);
  });
};

exports.delete_a_locality = function(req, res) {
  Locality.remove(req.params.id, function(err, locality) {
    if (err) res.send(err);
    res.json({ message: "Locality successfully deleted" });
  });
};
