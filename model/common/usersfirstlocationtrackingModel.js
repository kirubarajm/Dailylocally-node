"user strict";
var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
//Task object constructor
var Locationtracking = function(Locationtracking) {
  this.userid = Locationtracking.userid;
  this.lat = Locationtracking.lat;
  this.lon = Locationtracking.lon;
  this.address = Locationtracking.address;
  this.locality = Locationtracking.locality||'';
  this.city = Locationtracking.city||'';
  this.type = Locationtracking.type || 0;
  //this.created_at = new Date();
};

Locationtracking.createLocationtracking =async function createLocationtracking(tunnelflow, result) {

  var Locationtracking = await query("select * from users_first_location_tracking where userid ="+tunnelflow.userid+" ");

  if (Locationtracking.length ==0) {
    sql.query("INSERT INTO users_first_location_tracking set ?", tunnelflow, function(err, res) {
      if (err) {
        result(err, null);
      } else {
        //,res.insertId
 
        let resobj = {
          success: true,
          status:true,
          message: "Collection created successfully",
        };
        result(null, resobj);
      }
    });
  }else{

    let resobj = {
      success:true,
      status:true,
      message: "Already exist",
    };
    result(null, resobj);
  }
  
};

Locationtracking.getLocalityById = function getLocalityById(id, result) {
  sql.query("Select * from users_first_location_tracking where localityid = ? ", id, function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Locationtracking.getAllLocality = function getAllLocality(result) {
  sql.query("Select * from users_first_location_tracking", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};


module.exports = Locationtracking;
