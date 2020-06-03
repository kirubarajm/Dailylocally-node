"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var VendorProductMapping = function(vendorproductmapping) {
  this.vid = vendorproductmapping.vid;
  this.pid = vendorproductmapping.pid;
  this.price_agreement_approval = vendorproductmapping.price_agreement_approval;
  this.base_price = vendorproductmapping.base_price;
  this.other_charges = vendorproductmapping.other_charges;
  this.expiry_date = vendorproductmapping.expiry_date;  
}

//For Admin
VendorProductMapping.createVendorProductMapping = async function createVendorProductMapping(req) {
    req.active_status=1;
    sql.query("INSERT INTO Vendor_products_mapping set ?", req,async function(err, res) {
        if (err) {
            return err;
        } else {
             return res;
        }
    });    
};

VendorProductMapping.updateVendorProductMapping =async function updateVendorProductMapping(req) {
    sql.query("UPDATE Vendor_products_mapping SET ? WHERE vpmid = ?", [req, req.vpmid],async function(err, res) {
        if (err) {
            return err;
        } else {
            return res;
        }
      }
    );
};

module.exports = VendorProductMapping;