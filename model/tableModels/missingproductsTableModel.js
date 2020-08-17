"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var MissingProducts = function(misingproducts) {
  this.missing_id = misingproducts.missing_id;
  this.dopid = misingproducts.dopid;
  this.vpid = misingproducts.vpid;
  this.quantity = misingproducts.quantity ||0;
  this.cost = misingproducts.cost ||0;
  this.zoneid = misingproducts.zoneid
  this.from_type = misingproducts.from_type;
}

//For Admin
MissingProducts.createMissingProducts = async function createMissingProducts(req, result) {
    var insertdata = new MissingProducts(req);
    sql.query("INSERT INTO Missing_Products set ?", insertdata,async function(err, res) {
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

MissingProducts.updateMissingProducts =async function updateMissingProducts(req, result) {
    var updatedata = new MissingProducts(req);
    sql.query("UPDATE Missing_Products SET ? WHERE missing_id = ?", [updatedata, updatedata.missing_id],async function(err, res) {
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

module.exports = MissingProducts;