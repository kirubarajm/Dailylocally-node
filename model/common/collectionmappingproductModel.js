"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var constant = require('../constant.js');
var ZoneModel = require('../common/zoneModel');

var Collection_mapping_product = function(collection_mapping_product) {
  this.cpid = collection_mapping_product.cpid;
  this.cid = collection_mapping_product.cid;
  this.active_status = collection_mapping_product.active_status;
  this.pid = collection_mapping_product.pid;
}

Collection_mapping_product.createCollectionMappingProduct = async function createCollectionMappingProduct(req, result) {   
  req.active_status=1;
//   var insertdata = new Collection_mapping_product(req);
  var insertdata = req;
  console.log("insertdata ==>",insertdata);
  sql.query("INSERT INTO Collection_mapping_product set ?", insertdata,async function(err, res) {
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

Collection_mapping_product.updateCollectionMappingProduct =async function updateCollectionMappingProduct(req, result) {
  // var updatedata = new Collection(req);
  var updatedata = req;
  sql.query("UPDATE Collection_mapping_product SET ? WHERE cpid = ?", [updatedata, updatedata.cpid],async function(err, res) {
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

module.exports = Collection_mapping_product;