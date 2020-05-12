"user strict";
var sql = require("../db.js");

var Cluster = function(cluster) {
  this.clustername = cluster.clustername;
  this.avg_rating = cluster.avg_rating;
};

Cluster.getAllcluster = function getAllcluster(result) {
  sql.query("Select * from Cluster", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

module.exports = Cluster;
