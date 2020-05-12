"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
const constant = require("../constant");

var PackagingBoxType = function(packagingbox) {
    this.name = packagingbox.name;
    this.price = packagingbox.price;
  };
  

  PackagingBoxType.createPackagingBoxType = function createPackagingBoxType(packagingboxdetails,result) {
    sql.query("INSERT INTO PackagingBox set ?", packagingboxdetails, function(err, res) {
      if (err) {
        result(null, err);
      }else{
        let resobj = {
          success: true,
          status:true,
          message: "Packaging box created successfully.",
          
        };
        result(null, resobj);
      }
    });
  };

  PackagingBoxType.updatePackagingBoxType = function updatePackagingBoxType(packagingboxdetails,id,result) {
    sql.query("UPDATE PackagingBox set ? where id =?", [packagingboxdetails,id], function(err, res) {
      if (err) {
        result(null, err);
      }else{
        let resobj = {
          success: true,
          status:true,
          message: "Packaging box updated successfully.",
          
        };
        result(null, resobj);
      }
    });
  };

  PackagingBoxType.getPackagingBoxType = function getPackagingBoxType(result) {
    var sqlQuery="SELECT * from PackagingBox";
    sql.query(sqlQuery, function(err, res) {
      if (err) {
        result(null, err);
      }else{
        let resobj = {
          success: true,
          status:true,
          eat_cover_id:constant.order_cover_package_id,
          result :res
        };
        result(null, resobj);
      }
    });
  };

  PackagingBoxType.getSinglePackagingBoxType = function getSinglePackagingBoxType(id,result) {
    var sqlQuery="SELECT * from PackagingBox where id="+id;
    sql.query(sqlQuery, function(err, res) {
      if (err) {
        result(null, err);
      }else{
        let resobj = {
          success: true,
          status:true,
          eat_cover_id:constant.order_cover_package_id,
          result :res
        };
        result(null, resobj);
      }
    });
  };

module.exports = PackagingBoxType;