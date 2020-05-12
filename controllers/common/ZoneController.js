"use strict";
var Zone = require("../../model/common/zoneModel");

////Create Zone Controller
exports.create_a_Zone = function(req, res) {
  var new_Zone = new Zone(req.body);
  Zone.createZone(new_Zone, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////List All Zone Controller
exports.list_all_zone = function(req, res) {
  Zone.get_all_zone(req.body,function(err, faq) {
    if (err) res.send(err);
    res.send(faq);
  });
};

////Update Zone Controller
exports.update_a_Zone = function(req, res) {
  Zone.updateZone(req.body,function(err, faq) {
    if (err) res.send(err);
    res.send(faq);
  });
};

////Get zone based on lat and lng Controller
exports.check_map_boundaries = function(req, res) {
  Zone.check_map_boundaries(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};


////Update x factore
exports.update_a_xfactore = function(req, res) {
  if (!req.body.id) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide oid" });
  } else if (!req.body.xfactor) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide xfactor values"
      });
  } else {
  Zone.update_a_xfactore(req.body,function(err, faq) {
    if (err) res.send(err);
    res.send(faq);
  });
}
};