"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Subcategoryl1 = function(subcategoryl1) {
  this.name = subcategoryl1.name;
  this.image = subcategoryl1.image;
  this.catid = subcategoryl1.catid;
}

//For Admin
Subcategoryl1.createSubcategoryl1 = async function createSubcategoryl1(req, result) {
    req.active_status=1;
    sql.query("INSERT INTO SubcategoryL1 set ?", req,async function(err, res) {
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

Subcategoryl1.updateSubcategoryl1 =async function updateSubcategoryl1(req) {
    sql.query("UPDATE SubcategoryL1 SET ? WHERE scl1_id = ?", [req, req.scl1_id],async function(err, res) {
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

module.exports = Subcategoryl1;