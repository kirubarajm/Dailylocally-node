"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var MissingQuantityReport = function(missingquantityreport) {
  this.dopid = missingquantityreport.dopid;
  this.vpid = missingquantityreport.vpid;
  this.report_quantity = missingquantityreport.report_quantity;
  this.report_type = missingquantityreport.report_type;
  this.from_type = missingquantityreport.from_type
  this.zoneid = missingquantityreport.zoneid;
}

//For Admin
MissingQuantityReport.createMissingQuantityReport = async function createMissingQuantityReport(req, result) {
    req.active_status=0;
    sql.query("INSERT INTO Missing_Quantity_Report set ?", req,async function(err, res) {
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
    sql.query("UPDATE Missing_Quantity_Report SET ? WHERE report_id = ?", [req, req.id],async function(err, res) {
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