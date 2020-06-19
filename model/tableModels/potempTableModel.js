"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var POtemp = function(potemp) {
  this.prid = potemp.prid;
  this.vpid = potemp.vpid;
  this.vid = potemp.vid;
  this.requested_quantity = potemp.requested_quantity;
  this.due_date = potemp.due_date;
  this.buyer_comment = potemp.buyer_comment;
  this.actual_quantity = potemp.actual_quantity;
}

//For Admin
POtemp.createPOtemp = async function createPOtemp(req, result) {
    req.active_status=0;
    sql.query("INSERT INTO POtemp set ?", req,async function(err, res) {
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
    sql.query("UPDATE POtemp SET ? WHERE tempid = ?", [req, req.tempid],async function(err, res) {
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