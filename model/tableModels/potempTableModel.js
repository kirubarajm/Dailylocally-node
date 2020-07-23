"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var POtemp = function(potemp) {
  this.tempid = potemp.tempid;
  this.prid = potemp.prid;
  this.vpid = potemp.vpid;
  this.vid = potemp.vid;
  this.requested_quantity = potemp.requested_quantity;
  this.due_date = potemp.due_date;
  this.buyer_comment = potemp.buyer_comment;
  this.actual_quantity = potemp.actual_quantity;
  this.zoneid = potemp.zoneid;
  this.delete_status = potemp.delete_status || 0;
  this.created_by = potemp.created_by;
  this.vendor_assigned_by = potemp.vendor_assigned_by;
}

//For Admin
POtemp.createPOtemp = async function createPOtemp(req, result) {
    var insertdata = new POtemp(req);
    console.log("insertdata ==>",insertdata);
    sql.query("INSERT INTO POtemp set ?", insertdata,async function(err, res) {
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

POtemp.updatePOtemp =async function updatePOtemp(req, result) {
    var updatedata = new POtemp(req);
    sql.query("UPDATE POtemp SET ? WHERE tempid = ?", [updatedata, updatedata.tempid],async function(err, res) {
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

module.exports = POtemp;