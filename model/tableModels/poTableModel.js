"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var PO = function(po) {
  this.poid = po.poid;
  this.vid = po.vid;
  this.cost = po.cost;
  this.zoneid = po.zoneid;
  this.po_status = po.po_status;
}

//For Admin
PO.createPO = async function createPO(req, result) {
    var insertdata = new PO(req);
    sql.query("INSERT INTO PO set ?", insertdata,async function(err, res) {
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
    var updatedata = new PO(req);
    sql.query("UPDATE PO SET ? WHERE poid = ?", [updatedata, updatedata.poid],async function(err, res) {
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