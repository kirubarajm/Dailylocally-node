"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var ProductLive = function(productlive) {
  this.zoneid = productlive.zoneid;
  this.pid = productlive.pid;
  this.live_status = productlive.live_status;
}

//For Admin
ProductLive.createProductLive = async function createProductLive(req, result) {
    sql.query("INSERT INTO Product_live set ?", req,async function(err, res) {
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

ProductLive.updateProductLive =async function updateProductLive(req, result) {
    sql.query("UPDATE Product_live SET ? WHERE vpid = ?", [req, req.vpid],async function(err, res) {
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

module.exports = ProductLive;