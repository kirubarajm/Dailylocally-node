"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var ClusterCollectionMapping = function(clustercollectionmapping) {
  this.cmid = clustercollectionmapping.cmid
  this.cid = clustercollectionmapping.cid;
  this.cluid = clustercollectionmapping.cluid;
  this.active_status = clustercollectionmapping.active_status;
}

//For Admin
ClusterCollectionMapping.createClusterCollectionMapping = async function createClusterCollectionMapping(req, result) {   
    var insertdata = new ClusterCollectionMapping(req);
    sql.query("INSERT INTO Cluster_Collection_mapping set ?", insertdata,async function(err, res) {
        if (err) {
            let resobj = {
                success: true,
                status: false,
                message: err
            };
            result(null, resobj);
        } else {
            let resobj = {
                success: true,
                status: true,
                result: res
            };
            result(null, resobj);
        }
    });    
};

ClusterCollectionMapping.updateClusterCollectionMapping =async function updateClusterCollectionMapping(req, result) {
    var updatedata = new ClusterCollectionMapping(req);
    sql.query("UPDATE Cluster_Collection_mapping SET ? WHERE cmid = ?", [updatedata, updatedata.cmid],async function(err, res) {
        if (err) {
            let resobj = {
                success: true,
                status: false,
                message: err
            };
            result(null, resobj);
        } else {
            let resobj = {
                success: true,
                status: true,
                result: res
            };
            result(null, resobj);
        }
      }
    );
};

module.exports = ClusterCollectionMapping;