"use strict";

var Cluster = require("../../model/common/clusterModel");

exports.list_all_Cluster = function(req, res) {
  Cluster.getAllcluster(function(err, cluster) {
    if (err) res.send(err);
    res.send(cluster);
  });
};
