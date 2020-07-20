"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var MoveitTripHistory = function(moveitriphistory) {
  this.id = moveitriphistory.id;
  this.doid = moveitriphistory.doid;
  this.tripid = moveitriphistory.tripid;
  this.type = moveitriphistory.type;
  this.created_by = moveitriphistory.created_by;
  this.zoneid = moveitriphistory.zoneid;
}

//For Admin
MoveitTripHistory.createMoveitTripHistory = async function createMoveitTripHistory(req, result) {   
    var insertdata = new MoveitTripHistory(req);
    sql.query("INSERT INTO Moveit_trip_history set ?", insertdata,async function(err, res) {
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

MoveitTripHistory.updateMoveitTripHistory =async function updateMoveitTripHistory(req, result) {
    var updatedata = new MoveitTripHistory(req);
    sql.query("UPDATE Moveit_trip_history SET ? WHERE id = ?", [updatedata, updatedata.id],async function(err, res) {
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

module.exports = MoveitTripHistory;