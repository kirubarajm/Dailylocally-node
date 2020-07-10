"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var MissingQuantityReport = function(missingquantityreport) {
  this.report_id = missingquantityreport.report_id;
  this.dopid = missingquantityreport.dopid;
  this.vpid = missingquantityreport.vpid;
  this.report_quantity = missingquantityreport.report_quantity;
  this.report_type = missingquantityreport.report_type;
  this.from_type = missingquantityreport.from_type
  this.zoneid = missingquantityreport.zoneid;
}

//For Admin
MissingQuantityReport.createMissingQuantityReport = async function createMissingQuantityReport(req, result) {
    var insertdata = new MissingQuantityReport(req);
    sql.query("INSERT INTO Missing_Quantity_Report set ?", insertdata,async function(err, res) {
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

MissingQuantityReport.updateMissingQuantityReport =async function updateMissingQuantityReport(req, result) {
    var updatedata = new MissingQuantityReport(req);
    sql.query("UPDATE Missing_Quantity_Report SET ? WHERE report_id = ?", [updatedata, updatedata.report_id],async function(err, res) {
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

module.exports = MissingQuantityReport;