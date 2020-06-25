"user strict";
var sql = require("../db.js");
const util = require('util');
var constant = require('../constant.js');
var request = require('request');
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var moment = require("moment");
var Collection = require("../../model/common/collectionModel");

const query = util.promisify(sql.query).bind(sql);


var ClusterUser = function(clusteruser) {
  this.cluid = clusteruser.cluid || 2;
  this.userid = clusteruser.userid;
};


ClusterUser.create_a_cluster_user =async function create_a_cluster_user(new_cluster,result) {
  
  sql.query("INSERT INTO Cluster_user_table set ?", new_cluster, function(err,res2) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {

   
    }
  });
    
};




module.exports = ClusterUser;