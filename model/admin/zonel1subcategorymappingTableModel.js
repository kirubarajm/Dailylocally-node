"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var L1SubcategoryMapping = function(l1subcategorymapping) {
  this.master_l1_subcatid = l1subcategorymapping.master_l1_subcatid;
  this.zoneid = l1subcategorymapping.zoneid;
  this.active_status = l1subcategorymapping.active_status;
}

//For Admin
L1SubcategoryMapping.createL1SubcategoryMapping = async function createL1SubcategoryMapping(req, result) {
    sql.query("INSERT INTO Zone_l1_subcategory_mapping set ?", req,async function(err, res) {
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

L1SubcategoryMapping.updateL1SubcategoryMapping =async function updateL1SubcategoryMapping(req, result) {
    sql.query("UPDATE Zone_l1_subcategory_mapping SET ? WHERE virtual_l1_subcatid = ?", [req, req.virtual_l1subcatid],async function(err, res) {
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

module.exports = L1SubcategoryMapping;