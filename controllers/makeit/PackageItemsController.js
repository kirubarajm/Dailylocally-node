"use strict";

var PackageItems = require("../../model/makeit/packageitemsModel.js");

exports.packageitemlist = function(req, res) {
  PackageItems.packageitemlist(req.params, function(err, result) {
    console.log("controller");
    console.log("res", result);

    if (err) res.send(err);
    res.send(result);
  });
};

