"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var L2SubcategoryMapping = function(l2subcategorymapping) {
  this.master_l2_subcatid = l2subcategorymapping.master_l2_subcatid;
  this.zoneid = l2subcategorymapping.zoneid;
  this.active_status = l2subcategorymapping.active_status;
}

//For Admin
L2SubcategoryMapping.createL2SubcategoryMapping = async function createL2SubcategoryMapping(req, result) {
    sql.query("INSERT INTO Zone_l2_subcategory_mapping set ?", req,async function(err, res) {
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

L2SubcategoryMapping.updateL2SubcategoryMapping =async function updateL2SubcategoryMapping(req, result) {
    sql.query("UPDATE Zone_l2_subcategory_mapping SET ? WHERE virtual_l2_subcatid = ?", [req, req.virtual_l2subcatid],async function(err, res) {
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

module.exports = L2SubcategoryMapping;