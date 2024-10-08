"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var StockKeeping = function(stockkeeping) {
    this.skid = stockkeeping.skid;
    this.stockid = stockkeeping.stockid;
    this.vpid = stockkeeping.vpid;
    this.product_name = stockkeeping.product_name;
    this.cat_id = stockkeeping.cat_id;
    this.category_name = stockkeeping.category_name;
    this.scl1_id = stockkeeping.scl1_id;
    this.subcategoryl1_name = stockkeeping.subcategoryl1_name;
    this.scl2_id = stockkeeping.scl2_id;
    this.subcategoryl2_name = stockkeeping.subcategoryl2_name;
    this.price = stockkeeping.price;
    this.missing_quantity = stockkeeping.missing_quantity ||0;
    this.boh = stockkeeping.boh ||0;
    this.actual_quantity = stockkeeping.actual_quantity ||0;
    this.in_sorting = stockkeeping.in_sorting ||0;
    this.type = stockkeeping.type;
    this.purchase_type = stockkeeping.purchase_type ||0;
    this.purchase_quantity = stockkeeping.purchase_quantity ||0;
    this.other_purchase_quantity = stockkeeping.other_purchase_quantity ||0;
    this.purchase_image = stockkeeping.purchase_image ||0;
    this.wastage = stockkeeping.wastage ||0;
    this.wastage_image = stockkeeping.wastage_image;
    this.zoneid = stockkeeping.zoneid;
    this.commend = stockkeeping.commend;
    this.weight = stockkeeping.weight;
    this.delete_status = stockkeeping.delete_status;
}

//For Admin
StockKeeping.createStockKeeping = async function createStockKeeping(req, result) {
    var insertdata = new StockKeeping(req);
    sql.query("INSERT INTO StockKeeping set ?", insertdata,async function(err, res) {
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

StockKeeping.updateStockKeeping =async function updateStockKeeping(req, result) {
    var updatedata = new StockKeeping(req);
    sql.query("UPDATE StockKeeping SET ? WHERE skid = ?", [updatedata, updatedata.skid],async function(err, res) {
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

module.exports = StockKeeping;