"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var dayorder = require("../../model/common/dayorderModel");
var constant = require("../constant.js");
var request = require('request');

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
  

Dayorderproducts.dayorder_distance_calculation = async function dayorder_distance_calculation(req,result) {
  //https://maps.googleapis.com/maps/api/directions/json?origin=12.9801,80.2184&destination=13.0072,80.2064&key=AIzaSyDsjqcaz5Ugj7xoBn9dhOedDWE1uyW82Nc
    var distance_url ="https://maps.googleapis.com/maps/api/directions/json?origin="+req.orglat+","+req.orglon+"&destination="+req.deslat+","+req.deslon+"&key="+constant.distanceapiKey+"";
  
    
    request({method: "GET",rejectUnauthorized: false,url: distance_url},async function(error,data) {
        if (error) {
          console.log("error: ", err);
          result(null, err);
        } else {
        
          // console.log(data.statusCode);
          if (data.statusCode === 200) {
            routesdata = JSON.parse(data.body)
      
            var caldistance = routesdata.routes;
            var deliverytimedata = caldistance[0].legs;
                 
            var Lastmile = parseInt(deliverytimedata[0].distance.text);

              console.log("Lastmile",Lastmile);
              console.log("req.id",req.id);

              var update_lastmile = await query("UPDATE Dayorder SET Lastmile ='"+Lastmile+"' WHERE id = '"+req.id+"' ");

    
          }
             
        }
      }
    );
  
  };
  
module.exports = Dayorderproducts;