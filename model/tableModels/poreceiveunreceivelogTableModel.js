"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var POReceiveUnReceiveLog = function(poreceiveunreceivelog) {
  this.id = poreceiveunreceivelog.id;
  this.poid = poreceiveunreceivelog.poid;
  this.popid = poreceiveunreceivelog.popid;
  this.type = poreceiveunreceivelog.type;
  this.quantity = poreceiveunreceivelog.quantity;
  this.delivery_note = poreceiveunreceivelog.delivery_note;
  this.zoneid = poreceiveunreceivelog.zoneid;
}

//For Admin
POReceiveUnReceiveLog.createPOlog = async function createPOlog(req, result) {
    var insertdata = new POReceiveUnReceiveLog(req);
    sql.query("INSERT INTO PO_Receive_Unreceive_Log set ?", insertdata,async function(err, res) {
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

POReceiveUnReceiveLog.updatePOlog =async function updatePOlog(req, result) {
    var updatedata = new POReceiveUnReceiveLog(req);
    sql.query("UPDATE PO_Receive_Unreceive_Log SET ? WHERE id = ?", [updatedata, updatedata.id],async function(err, res) {
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

module.exports = POReceiveUnReceiveLog;