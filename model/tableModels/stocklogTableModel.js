"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var StockLog = function(stocklog) {
  this.stockid = stocklog.stockid;
  this.vpid = stocklog.vpid;
  this.popid = stocklog.popid;
  this.dopid = stocklog.dopid;
  this.type = stocklog.type;
  this.from_type = stocklog.from_type;
  this.quantity = stocklog.quantity;
  this.zoneid = stocklog.zoneid;
}

//For Admin
StockLog.createStockLog = async function createStockLog(req, result) {
    var insertdata = new StockLog(req);
    sql.query("INSERT INTO Stock_Log set ?", insertdata,async function(err, res) {
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

StockLog.updateStockLog =async function updateStockLog(req, result) {
    var updatedata = new StockLog(req);
    sql.query("UPDATE Stock_Log SET ? WHERE id = ?", [updatedata, updatedata.id],async function(err, res) {
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

module.exports = StockLog;