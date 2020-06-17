"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var ZoneCategoryMapping = function(zonecategorymapping) {
  this.master_catid = zonecategorymapping.master_catid;
  this.zoneid = zonecategorymapping.zoneid;
  this.active_status = zonecategorymapping.active_status;
}

//For Admin
ZoneCategoryMapping.createZoneCategoryMapping = async function createZoneCategoryMapping(req, result) {
    sql.query("INSERT INTO Zone_category_mapping set ?", req,async function(err, res) {
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

ZoneCategoryMapping.updateZoneCategoryMapping =async function updateZoneCategoryMapping(req, result) {
    sql.query("UPDATE Zone_category_mapping SET ? WHERE virtual_catid = ?", [req, req.virtual_catid],async function(err, res) {
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

module.exports = ZoneCategoryMapping;