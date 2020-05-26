"user strict";
var sql = require("../db.js");
const util = require('util');
var constant = require('../constant.js');
var request = require('request');
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var moment = require("moment");


const query = util.promisify(sql.query).bind(sql);


var ProductMaster = function(productMaster) {
  this.hsn_code = productMaster.hsn_code;
  this.Productname = productMaster.Productname;
  this.image = productMaster.image;
  this.brand = productMaster.brand;
  this.mrp = productMaster.mrp;
  this.basiccost = productMaster.basiccost;
  this.discount_cost = productMaster.discount_cost;
  this.gst = productMaster.gst;
  this.scl1_id = productMaster.scl1_id;
  this.scl2_id = productMaster.scl2_id;
  this.subscription = productMaster.subscription;
  this.weight = productMaster.weight;
  this.packettype = productMaster.packettype;
  this.packetsize = productMaster.packetsize;
  this.vegtype = productMaster.vegtype;
  this.tag = productMaster.tag;
  this.short_desc = productMaster.short_desc;
  this.shelf_life = productMaster.shelf_life;

};

ProductMaster.get_ProductMaster_list = async function get_ProductMaster_list(req,result) {
  
    var radiuslimit         = constant.radiuslimit;
    var servicable_status = true;
    var userdetails       = await query("select * from User where userid = "+req.userid+" ");
    
    if (userdetails.length ==0) {
      let resobj = {
        success: true,
        status:false,
        serviceablestatus: servicable_status,
        unserviceable_title:"Sorry! Your area is not serviceable.",
        unserviceable_subtitle :"We are serving in selected areas of Chennai only",
        empty_url:"https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1586434698908-free%20delivery%20collection-03.png",
        empty_content:"Daily Locally",
        empty_subconent :"Daily Locally",
        header_content:"Hi <b>"+userdetails[0].name+"</b>,<br> what can we get you tomorrow morning?",
        header_subconent :"Guaranteed one day delivery for orders before 9 PM",
        category_title :"Product List",
        message : 'user not found',
        result: []
      };  
      result(null, resobj);
  
    }else{


      var get_nearby_zone = await query("select *, ROUND( 3959 * acos( cos( radians('" +
      req.lat +
      "') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('" +
      req.lon +
      "') ) + sin( radians('" +
      req.lat +
      "') ) * sin(radians(lat)) ) , 2) AS distance from Zone  order by distance asc limit 1");
  
  
    if (get_nearby_zone.length !=0) {
      

      if (get_nearby_zone[0].distance > radiuslimit) {
        servicable_status =false;
      }
    }


    if (!req.scl2_id) {
        req.scl2_id=0;
    }

    // var sub_l2_category_query= "Select * from SubcategoryL2 where scl1_id=  '"+req.scl1_id+"' ";
    var product_list = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join Fav faa on faa.pid = pm.pid and faa.userid = '"+req.userid+"' where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and pm.scl2_id='"+req.scl2_id+"' and pm.scl1_id= '"+req.scl1_id+"'";


  sql.query(product_list,async function(err, res) {
    if (err) {
      result(err, null);
    } else {


      for (let i = 0; i < res.length; i++) {
     
        res[i].servicable_status=servicable_status;
        
      }

  

      let resobj = {
        success: true,
        status:true,
        serviceablestatus: servicable_status,
        unserviceable_title:"Sorry! Your area is not serviceable.",
        unserviceable_subtitle :"We are serving in selected areas of Chennai only",
        empty_url:"https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1586434698908-free%20delivery%20collection-03.png",
        empty_content:"Daily Locally",
        empty_subconent :"Daily Locally",
        header_content:"Hi <b>"+userdetails[0].name+"</b>,<br> what can we get you tomorrow morning?",
        header_subconent :"Guaranteed one day delivery for orders before 9 PM",
        category_title :"Product List",
        result: res
      };
      result(null, resobj);
    }
  });
}
};


ProductMaster.get_collection_product_list = async function get_collection_product_list(req,result) {
  
  var radiuslimit         = constant.radiuslimit;
  var servicable_status = true;
  var userdetails       = await query("select * from User where userid = "+req.userid+" ");
  
  if (userdetails.length ==0) {
    let resobj = {
      success: true,
      status:false,
      serviceablestatus: servicable_status,
      unserviceable_title:"Sorry! Your area is not serviceable.",
      unserviceable_subtitle :"We are serving in selected areas of Chennai only",
      empty_url:"https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1586434698908-free%20delivery%20collection-03.png",
      empty_content:"Daily Locally",
      empty_subconent :"Daily Locally",
      header_content:"Hi <b>"+userdetails[0].name+"</b>,<br> what can we get you tomorrow morning?",
      header_subconent :"Guaranteed one day delivery for orders before 9 PM",
      category_title :"Product List",
      message : 'user not found',
      result: []
    };  
    result(null, resobj);

  }else{


    var get_nearby_zone = await query("select *, ROUND( 3959 * acos( cos( radians('" +
    req.lat +
    "') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('" +
    req.lon +
    "') ) + sin( radians('" +
    req.lat +
    "') ) * sin(radians(lat)) ) , 2) AS distance from Zone  order by distance asc limit 1");


  if (get_nearby_zone.length !=0) {
    

    if (get_nearby_zone[0].distance > radiuslimit) {
      servicable_status =false;
    }
  }


  if (!req.scl2_id) {
      req.scl2_id=0;
  }

  var product_list = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join Fav faa on faa.pid = pm.pid and faa.userid = '"+req.userid+"' left join SubcategoryL1 sub1 on sub1.scl1_id=pm.scl1_id where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and pm.scl1_id='"+req.scl1_id+"' and sub1.catid= '"+req.catid+"'";
sql.query(product_list,async function(err, res) {
  if (err) {
    result(err, null);
  } else {


    for (let i = 0; i < res.length; i++) {
   
      res[i].servicable_status=servicable_status;
      
    }


    let resobj = {
      success: true,
      status:true,
      serviceablestatus: servicable_status,
      unserviceable_title:"Sorry! Your area is not serviceable.",
      unserviceable_subtitle :"We are serving in selected areas of Chennai only",
      empty_url:"https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1586434698908-free%20delivery%20collection-03.png",
      empty_content:"Daily Locally",
      empty_subconent :"Daily Locally",
      header_content:"Hi <b>"+userdetails[0].name+"</b>,<br> what can we get you tomorrow morning?",
      header_subconent :"Guaranteed one day delivery for orders before 9 PM",
      category_title :"Product List",
      result: res
    };
    result(null, resobj);
  }
});
}
};
module.exports = ProductMaster;