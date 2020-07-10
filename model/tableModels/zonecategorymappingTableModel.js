"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var ZoneCategoryMapping = function(zonecategorymapping) {
  this.virtual_catid = zonecategorymapping.virtual_catid
  this.master_catid = zonecategorymapping.master_catid;
  this.zoneid = zonecategorymapping.zoneid;
  this.active_status = zonecategorymapping.active_status;
}

//For Admin
ZoneCategoryMapping.createZoneCategoryMapping = async function createZoneCategoryMapping(req, result) {
    var insertdata = new ZoneCategoryMapping(req);
    sql.query("INSERT INTO Zone_category_mapping set ?", insertdata,async function(err, res) {
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
    var updatedata = new ZoneCategoryMapping(req);
    sql.query("UPDATE Zone_category_mapping SET ? WHERE virtual_catid = ?", [updatedata, updatedata.virtual_catid],async function(err, res) {
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