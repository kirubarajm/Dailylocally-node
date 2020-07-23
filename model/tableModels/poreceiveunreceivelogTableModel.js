"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var POLog = function(polog) {
  this.id = polog.id;
  this.poid = polog.poid;
  this.popid = polog.popid;
  this.from_type = polog.from_type;
  this.quantity = polog.quantity;
  this.delivery_note = polog.delivery_note;
  this.zoneid = polog.zoneid;
  this.created_by = polog.created_by;
}

//For Admin
POLog.createPOlog = async function createPOlog(req, result) {
    var insertdata = new POLog(req);
    sql.query("INSERT INTO PO_Log set ?", insertdata,async function(err, res) {
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

POLog.updatePOlog =async function updatePOlog(req, result) {
    var updatedata = new POLog(req);
    sql.query("UPDATE PO_Log SET ? WHERE id = ?", [updatedata, updatedata.id],async function(err, res) {
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

module.exports = POLog;