"user strict";
var sql = require("../db.js");
var producthistory = require("../../model/makeit/liveproducthistoryModel.js");

//Task object constructor
var producthistory = function(producthistory) {
  this.makeit_id        = producthistory.makeit_id;
  this.product_id       = producthistory.product_id;
  this.actual_quantity  = producthistory.actual_quantity || 0;
  this.pending_quantity = producthistory.pending_quantity || 0;
  this.ordered_quantity = producthistory.ordered_quantity || 0;
  this.action           = producthistory.action || 0;
};

producthistory.createProducthistory = function createProducthistory(product_history,res) {
    console.log(product_history);
    sql.query("INSERT INTO Live_Product_History set ?", product_history, function(err,result) {
        if (err) {
            sql.rollback(function() {
                throw err;
            });
        //res(null, err);
        }
    });
};

module.exports = producthistory;