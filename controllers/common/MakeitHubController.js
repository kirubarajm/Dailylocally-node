"use strict";

var MakeitHub = require("../../model/common/makeithubModel");

exports.list_all_makeithubs = function(req, res) {
    MakeitHub.getAllMakeitHub(function(err, hub) {
    if (err) res.send(err);
    res.send(hub);
  });
};


