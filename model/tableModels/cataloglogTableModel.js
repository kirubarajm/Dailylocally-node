"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var CatalogLog = function(cataloglog) {
  this.logid = cataloglog.logid;
  this.id = cataloglog.id;
  this.type_id = cataloglog.type_id;
  this.action_type = cataloglog.action_type;
  this.zoneid = cataloglog.zoneid;
  this.created_by = cataloglog.created_by;
  this.created_at = cataloglog.created_at;
  this.updated_at = cataloglog.updated_at;
}

//For Admin
CatalogLog.createCatalogLog = async function createCatalogLog(req, result) {   
    req.active_status=0;
    var insertdata = new CatalogLog(req);
    sql.query("INSERT INTO Catalog_Log set ?", insertdata,async function(err, res) {
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

CatalogLog.updateCatalogLog =async function updateCatalogLog(req, result) {
    var updatedata = new CatalogLog(req);
    sql.query("UPDATE Catalog_Log SET ? WHERE logid = ?", [updatedata, updatedata.logid],async function(err, res) {
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

module.exports = CatalogLog;