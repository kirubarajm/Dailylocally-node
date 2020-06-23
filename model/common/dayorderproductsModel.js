"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var dayorder = require("../../model/common/dayorderModel");

var Dayorderproducts = function(Dayorderproducts) {
  this.doid = Dayorderproducts.doid;
  this.vpid = Dayorderproducts.vpid;
  this.orderid = Dayorderproducts.orderid;
  this.scm_status = Dayorderproducts.scm_status || 0;
  this.productname = Dayorderproducts.productname;
  this.quantity = Dayorderproducts.quantity;
  this.price = Dayorderproducts.price;
  this.received_quantity = Dayorderproducts.received_quantity;
  this.sorting_status = Dayorderproducts.sorting_status;
  this.product_hsn_code = Dayorderproducts.product_hsn_code;
  this.product_image = Dayorderproducts.product_image;
  this.product_brand = Dayorderproducts.product_brand;
  this.product_mrp = Dayorderproducts.product_mrp;
  this.product_basiccost = Dayorderproducts.product_basiccost;
  this.product_targetedbaseprice = Dayorderproducts.product_targetedbaseprice;
  this.product_discount_cost = Dayorderproducts.product_discount_cost;
  this.product_gst = Dayorderproducts.product_gst;
  this.product_scl1_id = Dayorderproducts.product_scl1_id;
  this.product_scl2_id = Dayorderproducts.product_scl2_id;
  this.product_subscription = Dayorderproducts.product_subscription;
  this.product_weight = Dayorderproducts.product_weight;
  this.product_uom = Dayorderproducts.product_uom;
  this.product_packetsize = Dayorderproducts.product_packetsize;
  this.product_vegtype = Dayorderproducts.product_vegtype;
  this.product_tag = Dayorderproducts.product_tag;
  this.product_short_desc = Dayorderproducts.product_short_desc;
  this.product_productdetails = Dayorderproducts.product_productdetails;
  this.product_Perishable = Dayorderproducts.product_Perishable;
};

//////////Create DayOrderProduct//////////////////////
Dayorderproducts.createDayorderproducts =async function createDayorderproducts(new_createDayorderproducts) {    
  sql.query("INSERT INTO Dayorder_products set ?", new_createDayorderproducts, async function(err, res1) {
    if (err) {
      let resobj = {
          success: true,
          status: false,
          message: err
      };
      //result(null, resobj);
      console.log("resobj==>",resobj);
    }else{
      let resobj = {
          success: true,
          status: true,
          result: res1
      };
      //result(null, resobj);
      console.log("resobj==>",resobj);
    }
  });  
};
  
module.exports = Dayorderproducts;