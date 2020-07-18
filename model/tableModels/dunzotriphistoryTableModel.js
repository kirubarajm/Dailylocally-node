"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var DunzoTripHistory = function(dunzotriphistory) {
  this.id = dunzotriphistory.id;
  this.doid = dunzotriphistory.doid;
  this.type = dunzotriphistory.type;
  this.zoneid = dunzotriphistory.zoneid;
  this.created_by = dunzotriphistory.created_by;
}

//For Admin
DunzoTripHistory.createDunzoTripHistory = async function createDunzoTripHistory(req, result) {   
    // var insertdata = new DunzoTripHistory(req);
    var insertdata = req;
    sql.query("INSERT INTO Dunzo_trip_history set ?", insertdata,async function(err, res) {
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

DunzoTripHistory.updateDunzoTripHistory =async function updateDunzoTripHistory(req, result) {
    var updatedata = new DunzoTripHistory(req);
    sql.query("UPDATE Dunzo_trip_history SET ? WHERE id = ?", [updatedata, updatedata.id],async function(err, res) {
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

module.exports = DunzoTripHistory;