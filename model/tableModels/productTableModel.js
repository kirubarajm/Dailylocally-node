"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Product = function(product) {
  this.pid = product.pid;
  this.hsn_code = product.hsn_code;
  this.Productname = product.productname;
  this.image = product.image;
  this.brand = product.brand;
  this.mrp = product.mrp;
  this.targetedbaseprice = product.targetedbaseprice;
  this.discount_cost = product.discount_cost;
  this.gst = product.gst;
  this.scl1_id = product.scl1_id;
  this.scl2_id = product.scl2_id ||0;
  this.subscription = product.subscription ||0;
  this.weight = product.weight;
  this.uom = product.uom;
  this.packetsize = product.packetsize;
  this.vegtype = product.vegtype;
  this.tag = product.tag;
  this.short_desc = product.short_desc;
  this.productdetails = product.productdetails;
  this.Perishable = product.Perishable;
  this.shelf_life = product.shelf_life;
  this.delete_status = product.delete_status ||0;
}

//For Admin
Product.createProduct = async function createProduct(req, result) {    
    req.active_status=1;
    var newproduct = new Product(req); 
    sql.query("INSERT INTO ProductMaster set ?", newproduct,async function(err, res) {
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

Product.updateProduct =async function updateProduct(req, result) {
    var updateproduct = new Product(req); 
    sql.query("UPDATE ProductMaster SET ? WHERE pid = ?", [updateproduct, updateproduct.pid],async function(err, res) {
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

module.exports = Product;