"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var WasteManagement = function(wastemanagement) {
  this.waste_id = wastemanagement.waste_id;
  this.dopid = wastemanagement.dopid;
  this.vpid = wastemanagement.vpid;
  this.quantity = wastemanagement.quantity;
  this.zoneid = wastemanagement.zoneid
  this.from_type = wastemanagement.from_type;
}

//For Admin
WasteManagement.createWasteManagement = async function createWasteManagement(req, result) {
    var insertdata = new WasteManagement(req);
    sql.query("INSERT INTO Waste_Management set ?", insertdata,async function(err, res) {
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

WasteManagement.updateWasteManagement =async function updateWasteManagement(req, result) {
    var updatedata = new WasteManagement(req);
    sql.query("UPDATE Waste_Management SET ? WHERE waste_id = ?", [updatedata, updatedata.waste_id],async function(err, res) {
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

module.exports = WasteManagement;