"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var PackagingBox = function(packagingbox) {
    this.boxtype = packagingbox.boxtype;
    this.sales_userid = packagingbox.sales_userid;
    this.makeit_userid = packagingbox.makeit_userid;
    this.count  = packagingbox.count;
    this.aid  = packagingbox.aid;
  };
  

  PackagingBox.createnewPackagingBox = function createnewPackagingBox(packagingboxdetails,res) {
    sql.query("INSERT INTO Packaging_Boxs set ?", packagingboxdetails, function(err, result) {
      if (err) {
        result(err, null);
      }
    });
  };


  PackagingBox.createPackagingBox = async function createPackagingBox(boxdetail,res) {
    var packingbox = await query(
      "Select * From Packaging_Boxs where sales_userid = '" +
      boxdetail.sales_userid +
        "' and makeit_userid = '" +
        boxdetail.makeit_userid +
        "' and boxtype = '" +
        boxdetail.boxtype +
        "'"
    );
    if (packingbox.length === 0) {
      sql.query("INSERT INTO Packaging_Boxs set ?", boxdetail, function(err, packinginsert) {
        if (err) {
          result(err, null);
        }
      });
    } else {
      var pid = packingbox[0].pid;
      var updateq="UPDATE Packaging_Boxs set count = '"+boxdetail.count+"' where pid='"+pid+"' and boxtype = '" +boxdetail.boxtype+"'"
      sql.query(updateq, function(err, packinginsert) {
        if (err) {
          result(err, null);
        }
      });
    }
 
};
module.exports = PackagingBox;