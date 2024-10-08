"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var VendorProductMapping = function(vendorproductmapping) {
  this.vpmid = vendorproductmapping.vpmid;
  this.vid = vendorproductmapping.vid;
  this.pid = vendorproductmapping.pid;
  this.price_agreement_approval = vendorproductmapping.price_agreement_approval;
  this.base_price = vendorproductmapping.base_price;
  this.other_charges = vendorproductmapping.other_charges;
  this.expiry_date = vendorproductmapping.expiry_date;  
}

//For Admin
VendorProductMapping.createVendorProductMapping = async function createVendorProductMapping(req, result) {
    req.active_status=1;
    var newdata = new VendorProductMapping(req);
    sql.query("INSERT INTO Vendor_products_mapping set ?", newdata,async function(err, res) {
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

VendorProductMapping.updateVendorProductMapping =async function updateVendorProductMapping(req, result) {
    var updatedata = new VendorProductMapping(req);
    sql.query("UPDATE Vendor_products_mapping SET ? WHERE vpmid = ?", [updatedata, updatedata.vpmid],async function(err, res) {
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

module.exports = VendorProductMapping;