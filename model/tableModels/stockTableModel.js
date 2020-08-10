"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Stock = function(stock) {
  this.stockid = stock.stockid;
  this.vpid = stock.vpid;
  this.quantity = stock.quantity ||0;
  this.zoneid = stock.zoneid;
  this.stock_status = stock.stock_status;
}

//For Admin
Stock.createStock = async function createStock(req, result) {
    var insertdata = new Stock(req);
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

Stock.updateStock =async function updateStock(req, result) {
    var updatedata = new Stock(req);
    sql.query("UPDATE Stock SET ? WHERE vpid = ?", [updatedata, updatedata.vpid],async function(err, res) {
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

Stock.cancel_product_quantity_update_Stock =async function cancel_product_quantity_update_Stock(req, result) {
    sql.query("UPDATE Stock SET quantity=quantity+? WHERE vpid = ? and zoneid=?", [req.quantity, req.vpid,req.zoneid],async function(err, res) {
        if (err) {
            let resobj = {
                success: true,
                status: false,
                message: err
            };
            // result(null, resobj);
        } else {
            let resobj = {
                success: true,
                status: true,
                result: res
            };
            // result(null, resobj);
        }
      }
    );
};

module.exports = Stock;