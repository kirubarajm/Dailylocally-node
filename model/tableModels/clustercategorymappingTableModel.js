"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var ClusterCategoryMapping = function(clustercategorymapping) {
  this.catmid = clustercategorymapping.catmid
  this.catid = clustercategorymapping.catid;
  this.cluid = clustercategorymapping.cluid;
  this.orderby_category = clustercategorymapping.orderby_category;
  this.active_status = clustercategorymapping.active_status;
}

//For Admin
ClusterCategoryMapping.createClusterCategoryMapping = async function createClusterCategoryMapping(req, result) {   
    var insertdata = new ClusterCategoryMapping(req);
    sql.query("INSERT INTO Cluster_Category_mapping set ?", insertdata,async function(err, res) {
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

ClusterCategoryMapping.updateClusterCategoryMapping =async function updateClusterCategoryMapping(req, result) {
    var updatedata = new ClusterCategoryMapping(req);
    sql.query("UPDATE Cluster_Category_mapping SET ? WHERE catmid = ?", [updatedata, updatedata.catmid],async function(err, res) {
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

module.exports = ClusterCategoryMapping;