"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var DunzoTrip = function(dunzotrip) {
  this.dunzoid = dunzotrip.dunzoid;
  this.doid = dunzotrip.doid;
  this.assigned_by = dunzotrip.assigned_by;
  this.assigned_at = dunzotrip.assigned_at;
  this.unassigned_by = dunzotrip.unassigned_by;
  this.unassigned_at = dunzotrip.unassigned_at;
  this.delivered_by = dunzotrip.delivered_by;
  this.delivered_at = dunzotrip.delivered_at;
  this.canceled_by = dunzotrip.canceled_by;
  this.canceled_at = dunzotrip.canceled_at;
  this.zoneid = dunzotrip.zoneid;
}

//For Admin
DunzoTrip.createDunzoTrip = async function createDunzoTrip(req, result) {   
    // var insertdata = new DunzoTrip(req);
    var insertdata = req;
    sql.query("INSERT INTO Dunzo_trip set ?", insertdata,async function(err, res) {
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

DunzoTrip.updateDunzoTrip =async function updateDunzoTrip(req, result) {
    var updatedata = new DunzoTrip(req);
    sql.query("UPDATE Dunzo_trip SET ? WHERE dunzoid = ?", [updatedata, updatedata.dunzoid],async function(err, res) {
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

module.exports = DunzoTrip;