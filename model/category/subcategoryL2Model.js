"user strict";
var sql = require("../db.js");
const util = require('util');
var constant = require('../constant.js');
var request = require('request');
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var moment = require("moment");


const query = util.promisify(sql.query).bind(sql);


var Sub_Category_L2 = function(sub_Category_L2) {
  this.name = sub_Category_L2.name;
  this.image = sub_Category_L2.image;
  this.scl1_id = sub_Category_L2.scl1_id;
};

Sub_Category_L2.get_Sub_Category_L2_list = async function get_Sub_Cget_Sub_Category_L2_listategory_L1_list(req,result) {
  
    var radiuslimit         = constant.radiuslimit;
    var servicable_status = true;
    var userdetails       = await query("select * from User where userid = "+req.userid+" ");
    var SubcategoryL1_details       = await query("select * from SubcategoryL1 where scl1_id=   '"+req.scl1_id+"' ");
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
        title : SubcategoryL1_details[0].name,
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

    // var sub_l2_category_query= "Select * from SubcategoryL2 where scl1_id=  '"+req.scl1_id+"' ";

    var sub_l2_category_query= "Select l2.* from SubcategoryL2 as  l2 left join ProductMaster pm on pm.scl2_id=l2.scl2_id  left join  Product_live pl on pl.vpid=pm.pid left join Zone_l2_subcategory_mapping zl2 on zl2.master_l2_subcatid =l2.scl2_id where l2.scl1_id=   '"+req.scl1_id+"' and pl.live_status=1 and zl2.zoneid='"+get_nearby_zone[0].id+"' group by l2.scl2_id";
        
  sql.query(sub_l2_category_query,async function(err, res) {
    if (err) {
      result(err, null);
    } else {

      var get_sub_cat2_images = await query("select * from Sub_category_images where type=3");


      for (let i = 0; i < res.length; i++) {
     
        res[i].servicable_status=servicable_status;
        
      }

      var product_list = await query("select * from ProductMaster pm left join Product_live pl on pl.pid=pm.pid where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and pm.scl2_id=0  and pm.scl1_id=  '"+req.scl1_id+"'");
  

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
        title : SubcategoryL1_details[0].name,
        product_list:product_list,
        get_sub_cat2_images:get_sub_cat2_images,
        result: res
      };
      result(null, resobj);
    }
  });
}
};

module.exports = Sub_Category_L2;