"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Product = function(product) {
  this.hsn_code = product.hsn_code;
  this.Productname = product.productname;
  this.image = product.image;
  this.brand = product.brand;
  this.mrp = product.mrp;
  this.basiccost = product.basiccost;
  this.discount_cost = product.discount_cost;
  this.gst = product.gst;
  this.scl1_id = product.scl1_id;
  this.scl2_id = product.scl2_id;
  this.subscription = product.subscription;
  this.weight = product.weight;
  this.packettype = product.packettype;
  this.uom = product.uom;
  this.packetsize = product.packetsize;
  this.vegtype = product.vegtype;
  this.tag = product.tag;
  this.short_desc = product.short_desc;
  this.productdetails = product.productdetails;
  this.Perishable = product.Perishable;
  this.shelf_life = product.shelf_life;
  this.active_status = product.active_status;
}

//For Admin
Product.createProduct = async function createProduct(req) {
    req.active_status=1;
    sql.query("INSERT INTO ProductMaster set ?", req,async function(err, res) {
        if (err) {
            return err;
        } else {
             return res;
        }
    });    
};

Product.updateProduct =async function updateProduct(req) {
    sql.query("UPDATE ProductMaster SET ? WHERE pid = ?", [req, req.pid],async function(err, res) {
        if (err) {
            return err;
        } else {
            return res;
        }
      }
    );
};

module.exports = Product;