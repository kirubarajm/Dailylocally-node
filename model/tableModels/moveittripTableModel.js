"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var MovietTrip = function(moviettrip) {
  this.tripid = moviettrip.tripid;
  this.moveit_id = moviettrip.moveit_id;
  this.trip_status = moviettrip.trip_status;
  this.start_time = moviettrip.start_time;
  this.end_time = moviettrip.end_time;
  this.cancel_time = moviettrip.cancel_time;
  this.trip_assigned_time = moviettrip.trip_assigned_time;
  this.moveit_accept_lat = moviettrip.moveit_accept_lat;
  this.moveit_accept_long = moviettrip.moveit_accept_long;
  this.moveit_accept_time = moviettrip.moveit_accept_time;
  this.moveit_notification_time = moviettrip.moveit_notification_time;
  this.done_by = moviettrip.done_by;
  this.zoneid = moveittrip.zoneid;
}

//For Admin
MovietTrip.createMovietTrip = async function createMovietTrip(req, result) {
    var insertdata = req;
    sql.query("INSERT INTO Moveit_trip set ?", insertdata,async function(err, res) {
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

MovietTrip.updateMovietTrip =async function updateMovietTrip(req, result) {
    var updatedata = new MovietTrip(req);
    sql.query("UPDATE Moveit_trip SET ? WHERE trip_id = ?", [updatedata, updatedata.trip_id],async function(err, res) {
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

module.exports = MovietTrip;