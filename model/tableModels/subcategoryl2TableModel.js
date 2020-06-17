"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Subcategoryl2 = function(subcategoryl2) {
  this.name = subcategoryl2.name;
  this.image = subcategoryl2.image;
  this.scl1_id = subcategoryl2.scl1_id;
}

//For Admin
Subcategoryl2.createSubcategoryl2 = async function createSubcategoryl2(req, result) {
    req.active_status=1;
    sql.query("INSERT INTO SubcategoryL2 set ?", req,async function(err, res) {
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

Subcategoryl2.updateSubcategoryl2 =async function updateSubcategoryl2(req) {
    sql.query("UPDATE SubcategoryL2 SET ? WHERE scl2_id = ?", [req, req.scl2_id],async function(err, res) {
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

module.exports = Subcategoryl2;