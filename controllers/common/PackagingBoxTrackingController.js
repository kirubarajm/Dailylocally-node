"use strict";
var PackagingBoxType = require("../../model/common/packagingboxTrackingModel");

////Create Package box Controller
exports.create_a_packagingbox = function(req, res) {
  var packagingBoxType = new PackagingBoxType(req.body);
  PackagingBoxType.createPackagingBoxType(packagingBoxType, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////Get List of All Package box Controller
exports.list_all_packagingbox = function(req, res) {
  PackagingBoxType.getPackagingBoxType(function(err, packagelist) {
    if (err) res.send(err);
    res.send(packagelist);
  });
};

////Get single Package box Controller
exports.list_single_packagingbox = function(req, res) {
  PackagingBoxType.getSinglePackagingBoxType(req.params.id,function(err, packagelist) {
    if (err) res.send(err);
    res.send(packagelist);
  });
};

////Update Package box Controller
exports.updatePackagingBoxType = function(req, res) {
  var packagingBoxType = new PackagingBoxType(req.body);
  PackagingBoxType.updatePackagingBoxType(packagingBoxType,req.body.id,function(err, result) {
    if (err) res.send(err);
    res.send(result);
  });
};