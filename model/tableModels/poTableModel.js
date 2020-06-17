"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var PO = function(po) {
  this.vid = po.vid;
  this.cost = po.cost;
  this.zoneid = po.zoneid;
  this.po_status = po.po_status;
}

//For Admin
PO.createPO = async function createPO(req, result) {
    sql.query("INSERT INTO PO set ?", req,async function(err, res) {
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

PO.updatePO =async function updatePO(req, result) {
    sql.query("UPDATE PO SET ? WHERE poid = ?", [req, req.poid],async function(err, res) {
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

module.exports = PO;