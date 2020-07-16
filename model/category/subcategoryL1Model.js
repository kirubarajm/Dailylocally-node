"user strict";
var sql = require("../db.js");
const util = require('util');
var constant = require('../constant.js');
var request = require('request');
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var moment = require("moment");


const query = util.promisify(sql.query).bind(sql);


var Sub_Category_L1 = function(sub_Category_L1) {
  this.name = sub_Category_L1.name;
  this.image = sub_Category_L1.image;
  this.catid = sub_Category_L1.catid;
};

Sub_Category_L1.get_Sub_Category_L1_list = async function get_Sub_Category_L1_list(req,result) {
  
    var radiuslimit         = constant.radiuslimit;
    var servicable_status = true;
    var userdetails       = await query("select * from User where userid = "+req.userid+" ");
    var category_details       = await query("select * from Category where catid = "+req.catid+" ");
    
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
        title :category_details[0].name,
        message : 'user not found',
        get_sub_cat_images:[],
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

    var sub_category_query= "Select l1.*,ca.image as cat_header_image from SubcategoryL1 as  l1 left join ProductMaster pm on pm.scl1_id=l1.scl1_id  left join  Product_live pl on pl.pid=pm.pid left join Category  as ca on l1.catid=ca.catid left join Zone_l1_subcategory_mapping zl1 on zl1.master_l1_subcatid =l1.scl1_id where l1.catid=  '"+req.catid+"' and pl.live_status=1 and zl1.zoneid='"+get_nearby_zone[0].id+"' group by l1.scl1_id ";
  sql.query(sub_category_query,async function(err, res) {
    if (err) {
      result(err, null);
    } else {


      // var get_sub_cat_images = await query("select * from Sub_category_images where type=2");

      var get_sub_cat_images = await query("select * from Category where catid='"+req.catid+"'");

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
        title :category_details[0].name,
        get_sub_cat_images:get_sub_cat_images,
        result: res
      };
      result(null, resobj);
    }
  });
}
};


Sub_Category_L1.get_collection_Sub_Category_L1_list = async function get_collection_Sub_Category_L1_list(req,result) {
  
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
      category_title :"Categories",
      message : 'user not found',
      get_sub_cat_images:[],
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


  var sub_category_query = "select sub1.* from Collection_mapping_product as cmp left join ProductMaster as pm on pm.pid=cmp.pid  join SubcategoryL1 as sub1 on sub1.scl1_id=pm.scl1_id  where cmp.cid='"+req.cid+"' group by pm.scl1_id";

sql.query(sub_category_query,async function(err, res) {
  if (err) {
    result(err, null);
  } else {


    // var get_sub_cat_images = await query("select * from Sub_category_images where type=2");
    var get_sub_cat_images = await query("select *,image as image_url from Category where catid='"+res[0].catid+"'");
    var collection_details = await query("select img_url as image_url from Collections where cid='"+req.cid+"'");

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
      category_title : collection_details[0].name,
      get_sub_cat_images: get_sub_cat_images,
      result: res
    };
    result(null, resobj);
  }
});
}
};
module.exports = Sub_Category_L1;