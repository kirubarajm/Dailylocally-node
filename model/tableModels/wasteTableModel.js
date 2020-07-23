"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Waste = function(waste) {
  this.waskeid = waste.waskeid;
  this.vpid = waste.vpid;
  this.quantity = waste.quantity;
  this.zoneid = waste.zoneid;
  this.stock_status = waste.stock_status;
}

//For Admin
Waste.createWaste = async function createWaste(req, result) {
    var insertdata = new Waste(req);
    sql.query("INSERT INTO Stock set ?", insertdata,async function(err, res) {
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

Waste.updateWaste =async function updateWaste(req, result) {
    var updatedata = new Waste(req);
    sql.query("UPDATE Waste SET ? WHERE vpid = ?", [updatedata, updatedata.vpid],async function(err, res) {
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

module.exports = Waste;