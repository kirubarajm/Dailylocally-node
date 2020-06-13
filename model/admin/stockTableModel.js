"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Stock = function(stock) {
  this.pid = stock.pid;
  this.quantity = stock.quantity;
  this.stock_status = stock.stock_status;
}

//For Admin
Stock.createStock = async function createStock(req, result) {
    sql.query("INSERT INTO Stock set ?", req,async function(err, res) {
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
                data: res
            };
            result(null, resobj);
        }
    });    
};

Stock.updateStock =async function updateStock(req, result) {
    sql.query("UPDATE Stock SET ? WHERE popid = ?", [req, req.poid],async function(err, res) {
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
                data: res
            };
            result(null, resobj);
        }
      }
    );
};

module.exports = Stock;