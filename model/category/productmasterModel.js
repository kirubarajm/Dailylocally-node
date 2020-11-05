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
  
     req.scl2_id = parseInt(req.scl2_id );
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

      var productlimit = 20;
      var page = req.page || 1;
      var startlimit = (page - 1) * productlimit;

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

    var brandquery  = "";
    var brandlist   = [];
    if (req.brandlist !== undefined || req.brandlist !== null) {
      brandlist = req.brandlist;
    }
  
    if (brandlist) {
      for (let i = 0; i < brandlist.length; i++) {
        brandquery = brandquery + " pm.brand = '" + brandlist[i].brand + "' or";
      }
    }
  
    brandquery = brandquery.slice(0, -2) + ")";


   

    // var sub_l2_category_query= "Select * from SubcategoryL2 where scl1_id=  '"+req.scl1_id+"' ";
    var product_list = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand "


    if (brandlist !== undefined) {
      if (req.scl2_id) {
        product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and  pl.live_status=1 and  (pm.scl1_id= '"+req.scl1_id+"' and pm.scl2_id= '"+req.scl2_id+"') and (" +brandquery;

      }else{
        product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and ( pl.live_status=1 and  pm.scl1_id= '"+req.scl1_id+"') and (" +brandquery;

      }
    }else{
      if (req.scl2_id) {
        product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and (pm.scl1_id= '"+req.scl1_id+"' and pm.scl2_id= '"+req.scl2_id+"') "
    }else{
        product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and pm.scl1_id= '"+req.scl1_id+"' "

    }
    }


    if (req.page  !=0 && req.page !=null) {
      if (req.sortid==1) {
    
        product_list = product_list+ " ORDER BY pm.Productname ASC limit " +startlimit +"," +productlimit +"";
       
      }else if(req.sortid==2) {
      
        product_list = product_list+ " ORDER BY pm.Productname Desc limit " +startlimit +"," +productlimit +"";
       
      }else if (req.sortid==3) {
  
        product_list = product_list+ " ORDER BY pm.mrp ASC limit " +startlimit +"," +productlimit +"";
  
      }else if (req.sortid==4) {
  
        product_list = product_list+ " ORDER BY pm.mrp DESC limit " +startlimit +"," +productlimit +"";
      }else{
        product_list = product_list+ " ORDER BY pm.Productname  limit " +startlimit +"," +productlimit +"";
      }
  

    } else {
      
       if (req.sortid==1) {
    
      product_list = product_list+ " ORDER BY pm.Productname ASC ";
     
    }else if(req.sortid==2) {
    
      product_list = product_list+ " ORDER BY pm.Productname Desc ";
     
    }else if (req.sortid==3) {

      product_list = product_list+ " ORDER BY pm.mrp ASC  ";

    }else if (req.sortid==4) {

      product_list = product_list+ " ORDER BY pm.mrp DESC ";
    }else{
      product_list = product_list+ " ORDER BY pm.Productname  ";
    }
    }


 

    // if (req.sortid==1) {
    
    //   product_list = product_list+ " ORDER BY pm.Productname ASC ";
     
    // }else if(req.sortid==2) {
    
    //   product_list = product_list+ " ORDER BY pm.Productname Desc ";
     
    // }else if (req.sortid==3) {

    //   product_list = product_list+ " ORDER BY pm.mrp ASC  ";

    // }else if (req.sortid==4) {

    //   product_list = product_list+ " ORDER BY pm.mrp DESC ";
    // }else{
    //   product_list = product_list+ " ORDER BY pm.Productname  ";
    // }

    // }else if (req.sortid==5) {

    //   product_list = product_list+ " ORDER BY br.brandname ASC ";

    // }else if (req.sortid==6) {
    //   product_list = product_list+ " ORDER BY br.brandname DESC ";
    // }

    //  console.log(product_list);
  sql.query(product_list,async function(err, res) {
    if (err) {
      result(err, null);
    } else {


      for (let i = 0; i < res.length; i++) {
     
        if (res[i].uom== 1 || res[i].uom==7) {
          res[i].weight = res[i].weight * 1000;
        }

        res[i].servicable_status=servicable_status;
        res[i].offer='offer';
        res[i].discount_cost_status=false;
        res[i].mrp_discount_amout=0;
        if ( res[i].discount_cost) {
          res[i].discount_cost_status=true;
          res[i].mrp_discount_amout = res[i].mrp - res[i].discount_cost ;
        }
        
        
      }

     


      // if (req.sortid==1) {
    
      //   res.sort((a,b) => (a.Productname  - b.Productname));
      // } else if (req.sortid==2) {
      //   // res.sort((a, b) => b.Productname - a.Productname);
      //   res.sort((a,b) => (b.Productname  - a.Productname));
      // }else if (req.sortid==3) {
      //   res.sort((a, b) => parseFloat(a.mrp) - parseFloat(b.mrp));
      // }else if (req.sortid==4) {
      //   res.sort((a, b) => parseFloat(b.mrp) - parseFloat(a.mrp));
      // }else if (req.sortid==5) {
      //   res.sort((a, b) => a.brandname - b.brandname);
      // }else if (req.sortid==6) {
      //   res.sort((a, b) => b.brandname - a.brandname);
      // }

      var totalcount = res.length;

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
        totalcount:totalcount,
        result: res
      };
      result(null, resobj);
    }
  });
}
};


ProductMaster.get_category_product_list = async function get_category_product_list(req,result) {
  
  req.scl1_id = parseInt(req.scl1_id );
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

   var productlimit = 20;
   var page = req.page || 1;
   var startlimit = (page - 1) * productlimit;

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

 var brandquery  = "";
 var brandlist   = [];
 if (req.brandlist !== undefined || req.brandlist !== null) {
   brandlist = req.brandlist;
 }

 if (brandlist) {
   for (let i = 0; i < brandlist.length; i++) {
     brandquery = brandquery + " pm.brand = '" + brandlist[i].brand + "' or";
   }
 }

 brandquery = brandquery.slice(0, -2) + ")";




 // var sub_l2_category_query= "Select * from SubcategoryL2 where scl1_id=  '"+req.scl1_id+"' ";
 var product_list = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand left join SubcategoryL1 sub1 on sub1.scl1_id=pm.scl1_id left join  Category cat on cat.catid=sub1.catid"


 if (brandlist !== undefined) {
   if (req.scl1_id) {
     product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and  pl.live_status=1 and  (cat.catid= '"+req.catid +"' and sub1.scl1_id= '"+req.scl1_id+"') and (" +brandquery;

   }else{
     product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and ( pl.live_status=1 and  cat.catid= '"+req.catid +"') and (" +brandquery;

   }
 }else{
   if (req.scl1_id) {
     product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and (cat.catid= '"+req.catid +"' and sub1.scl1_id= '"+req.scl1_id+"') "
 }else{
     product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and cat.catid= '"+req.catid +"' "

 }
 }


 if (req.page  !=0 && req.page !=null) {
   if (req.sortid==1) {
 
     product_list = product_list+ " ORDER BY pm.Productname ASC limit " +startlimit +"," +productlimit +"";
    
   }else if(req.sortid==2) {
   
     product_list = product_list+ " ORDER BY pm.Productname Desc limit " +startlimit +"," +productlimit +"";
    
   }else if (req.sortid==3) {

     product_list = product_list+ " ORDER BY pm.mrp ASC limit " +startlimit +"," +productlimit +"";

   }else if (req.sortid==4) {

     product_list = product_list+ " ORDER BY pm.mrp DESC limit " +startlimit +"," +productlimit +"";
   }else{
     product_list = product_list+ " ORDER BY pm.Productname  limit " +startlimit +"," +productlimit +"";
   }


 } else {
   
    if (req.sortid==1) {
 
   product_list = product_list+ " ORDER BY pm.Productname ASC ";
  
 }else if(req.sortid==2) {
 
   product_list = product_list+ " ORDER BY pm.Productname Desc ";
  
 }else if (req.sortid==3) {

   product_list = product_list+ " ORDER BY pm.mrp ASC  ";

 }else if (req.sortid==4) {

   product_list = product_list+ " ORDER BY pm.mrp DESC ";
 }else{
   product_list = product_list+ " ORDER BY pm.Productname  ";
 }
 }




 // if (req.sortid==1) {
 
 //   product_list = product_list+ " ORDER BY pm.Productname ASC ";
  
 // }else if(req.sortid==2) {
 
 //   product_list = product_list+ " ORDER BY pm.Productname Desc ";
  
 // }else if (req.sortid==3) {

 //   product_list = product_list+ " ORDER BY pm.mrp ASC  ";

 // }else if (req.sortid==4) {

 //   product_list = product_list+ " ORDER BY pm.mrp DESC ";
 // }else{
 //   product_list = product_list+ " ORDER BY pm.Productname  ";
 // }

 // }else if (req.sortid==5) {

 //   product_list = product_list+ " ORDER BY br.brandname ASC ";

 // }else if (req.sortid==6) {
 //   product_list = product_list+ " ORDER BY br.brandname DESC ";
 // }

  // console.log(product_list);
sql.query(product_list,async function(err, res) {
 if (err) {
   result(err, null);
 } else {


   for (let i = 0; i < res.length; i++) {
  
     if (res[i].uom== 1 || res[i].uom==7) {
       res[i].weight = res[i].weight * 1000;
     }

     res[i].servicable_status=servicable_status;
     res[i].offer='offer';
     res[i].discount_cost_status=false;
     res[i].mrp_discount_amout=0;
     if ( res[i].discount_cost) {
       res[i].discount_cost_status=true;
       res[i].mrp_discount_amout = res[i].mrp - res[i].discount_cost ;
     }
     
     
   }

  

   var totalcount = res.length;

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
     totalcount:totalcount,
     result: res
   };
   result(null, resobj);
 }
});
}
};



ProductMaster.get_product_details = async function get_product_details(req,result) {
  
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

 

  // var sub_l2_category_query= "Select * from SubcategoryL2 where scl1_id=  '"+req.scl1_id+"' ";
  var product_detail = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand  where  pl.vpid='"+req.vpid+"' "


sql.query(product_detail,async function(err, res) {
  if (err) {
    result(err, null);
  } else {


    for (let i = 0; i < res.length; i++) {
   
      if (res[i].uom== 1 || res[i].uom==7) {
        res[i].weight = res[i].weight * 1000;
      }
      // res[i].weight = res[i].weight * 1000;
      res[i].servicable_status=servicable_status;
      res[i].offer='offer';
      res[i].discount_cost_status=false;

      if (res[i].discount_cost) {
        res[i].discount_cost_status=true;
        res[i].mrp_discount_amout = res[i].mrp - res[i].discount_cost ;
      }
      
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



ProductMaster.get_order_product_details = async function get_order_product_details(req,result) {
  
  var pkts = 'pkts';
  var product_detail = "select dor.*,JSON_ARRAYAGG(JSON_OBJECT('pkts','"+pkts+"','packetsize',dp.product_packetsize , 'doid',dp.doid,'product_image',dp.product_image,'product_short_desc',dp.product_short_desc,'quantity_info',dp.quantity +'pkts','quantity', dp.quantity,'vpid',dp.vpid,'price',(dp.price*dp.quantity),'product_name',dp.productname,'product_name',dp.productname,'unit',um.name,'brandname',br.brandname,'weight',if(product_uom=1 || product_uom=7,pm.weight*1000,pm.weight),'dayorderstatus',dor.dayorderstatus,'Cancel_available',IF(dp.scm_status <=5,true,false),'product_date',Date(IF(dp.scm_status <=5,dor.date,IF(dp.scm_status =10,dp.delivery_date,IF(dp.scm_status =11,dp.product_cancel_time,dor.date)))),'scm_status',dp.scm_status,'scm_status_name',IF(dp.scm_status <=5,'inprogress',IF(dp.scm_status =10 ,'Deliverd',IF(dp.scm_status =11 ,'cancelled','Waiting for delivery')))  )) AS items from Orders ors left join Dayorder_products dp on dp.orderid=ors.orderid left join Dayorder dor on dor.id=dp.doid left join Product_live pl on pl.vpid=dp.vpid left join ProductMaster pm on pm.pid=pl.vpid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand  where dp.id='"+req.dayorderpid+"' and dp.doid='"+req.doid+"'  group by dp.vpid"

sql.query(product_detail,async function(err, res) {
  if (err) {
    result(err, null);
  } else {


    if (res.length !=0) {

      if (res[0].items) {
        var items = JSON.parse(res[0].items);
          res[0].items = items;
         //  res[0].items.quantity_info = items.length +" pkts";
       }

    }
    



    let resobj = {
      success: true,
      status:true,
      result: res
    };
    result(null, resobj);
  }
});
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
    
    var get_collection = await query("select * from  Collections where cid='"+req.cid+"'");

    // console.log(get_collection[0].classification_type);

    var product_list ="";
    if (get_collection[0].classification_type==1) { 
      //console.log("brand");
      product_list = "select pm.*,pl.*,l1.catid,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from  ProductMaster pm left join SubcategoryL1  as l1 on l1.catid=pm.scl1_id left join Product_live pl on pl.pid=pm.pid left join Brand br on br.id=pm.brand left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"'  where br.id = '"+get_collection[0].classification_id+"' and pl.live_status=1";
     
    // var productlist = await query(product_query);
    }else if(get_collection[0].classification_type==2){
       //console.log("category");
       product_list = "select pm.*,pl.*,l1.catid,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from Category ca left join Cluster_Category_mapping as ccm on ccm.catid=ca.catid left join SubcategoryL1  as l1 on l1.catid=ca.catid left join Zone_l1_subcategory_mapping as zl1sub on zl1sub.master_l1_subcatid=l1.scl1_id left join ProductMaster as pm on pm.scl1_id=l1.scl1_id left join Product_live as pl on pl.pid=pm.pid left join Zone_category_mapping as zcm on zcm.master_catid=ca.catid left join Brand br on br.id=pm.brand left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' where zcm.active_status=1 and ccm.active_status=1  and pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and ca.catid='"+get_collection[0].classification_id+"' ";
     
      // var productlist = await query(product_query);
    }else if(get_collection[0].classification_type==3){
      //console.log("sub-category 1");
      product_list = "Select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from SubcategoryL1 as  l1 left join ProductMaster pm on pm.scl1_id=l1.scl1_id  left join  Product_live pl on pl.pid=pm.pid left join Category  as ca on l1.catid=ca.catid left join Zone_l1_subcategory_mapping zl1 on zl1.master_l1_subcatid =l1.scl1_id left join Brand br on br.id=pm.brand left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' where  pl.live_status=1 and zl1.zoneid='"+get_nearby_zone[0].id+"' and l1.scl1_id=  '"+get_collection[0].classification_id+"' ";
     
      // var productlist = await query(product_query);
    }else if(get_collection[0].classification_type==4){
      //console.log("sub-category 2");
      product_list = "Select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from SubcategoryL2 as  l2 left join ProductMaster pm on pm.scl2_id=l2.scl2_id  left join  Product_live pl on pl.pid=pm.pid left join Zone_l2_subcategory_mapping zl2 on zl2.master_l2_subcatid =l2.scl2_id left join SubcategoryL1 l1 on l1.scl1_id=l2.scl1_id left join Brand br on br.id=pm.brand left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' where l2.scl2_id='"+get_collection[0].classification_id+"'   and pl.live_status=1 and zl2.zoneid='"+get_nearby_zone[0].id+"' ";
     
      // var productlist = await query(product_query);
    }else if(get_collection[0].classification_type==5){
      //console.log("sub-category 2");
      product_list = "Select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from SubcategoryL1 as  l1 left join ProductMaster pm on pm.scl1_id=l1.scl1_id  left join  Product_live pl on pl.pid=pm.pid left join  Collection_mapping_product cmp  on cmp.pid=pl.pid left join Category  as ca on l1.catid=ca.catid left join Zone_l1_subcategory_mapping zl1 on zl1.master_l1_subcatid =l1.scl1_id left join Brand br on br.id=pm.brand left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' where  pl.live_status=1 and zl1.zoneid='"+get_nearby_zone[0].id+"'  and cmp.cid='"+get_collection[0].cid+"' and cmp.active_status=1 ";
     
      // var productlist = await query(product_query);
    }else if(get_collection[0].classification_type==6){
      //console.log("sub-category 2");
      product_list = "Select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from SubcategoryL1 as  l1 left join ProductMaster pm on pm.scl1_id=l1.scl1_id  left join  Product_live pl on pl.pid=pm.pid left join  Collection_mapping_product cmp  on cmp.pid=pl.pid left join Category  as ca on l1.catid=ca.catid left join Zone_l1_subcategory_mapping zl1 on zl1.master_l1_subcatid =l1.scl1_id left join Brand br on br.id=pm.brand left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' where  pl.live_status=1 and zl1.zoneid='"+get_nearby_zone[0].id+"'  and pm.mrp BETWEEN  '"+get_collection[0].start_price+"' and  '"+get_collection[0].end_price+"'  ";
     
      // var productlist = await query(product_query);
    }
    
    var scl1_id = '';

    if (req.scl1_id !=0) {
      product_list = product_list+ " and pm.scl1_id='"+req.scl1_id+"'"
    } 
    console.log("product_list==>",product_list);
    product_list = product_list+ " group by pm.pid";

    // console.log("product_list==>",product_list);
    if (req.sortid==1) {  
      product_list = product_list+ " ,pl.vpid ORDER BY pm.Productname ASC ";   
    }else if (req.sortid==2) {  
      product_list = product_list+ " ,pl.vpid ORDER BY pm.Productname DESC ";   
    }else if (req.sortid==3) {
      product_list = product_list+ " ,pl.vpid ORDER BY pm.mrp ASC ";
    }else if (req.sortid==4) {
      product_list = product_list+ " ,pl.vpid ORDER BY pm.mrp DESC ";
    }

//  console.log(product_list);

    sql.query(product_list,async function(err, res) {
      if (err) {
        result(err, null);
      } else {  
        // console.log("res=>",res);
        for (let i = 0; i < res.length; i++) {      
          if (res[i].uom== 1 || res[i].uom==7) {
            res[i].weight = res[i].weight * 1000;
          }
          
          res[i].servicable_status=servicable_status;
          res[i].offer='offer';
          res[i].discount_cost_status=false;
          res[i].mrp_discount_amout=0;
          if ( res[i].discount_cost) {
            res[i].discount_cost_status=true;
            res[i].mrp_discount_amout = res[i].mrp - res[i].discount_cost ;
          }     
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


ProductMaster.get_product_search = async function get_product_search(req,result) {

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
  var product_list1 = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"'  where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and pm.Productname like '%"+req.search+"%' ";

  console.log("product_list",product_list1);
sql.query(product_list1,async function(err, res) {
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


ProductMaster.get_brand_list = async function get_brand_list(req,result) {
if (req.scl2_id ==0) {
  var brand_list = "select pm.brand,br.brandname from ProductMaster as pm left join Brand br on br.id=pm.brand where pm.scl1_id= "+req.scl1_id+"  group by  pm.brand ";

}else{
    var brand_list = "select pm.brand,br.brandname from ProductMaster as pm left join Brand br on br.id=pm.brand where pm.scl1_id= "+req.scl1_id+" or pm.scl2_id= "+req.scl2_id+" group by  pm.brand ";

}
  // console.log(brand_list)
  sql.query(brand_list,async function(err, res) {
    if (err) {
      result(err, null);
    } else {
     

  
      let resobj = {
        success: true,
        status:true,
        title :"brand List",
        result: res
      };
      result(null, resobj);
    }
  });
};


ProductMaster.get_category_product_brand_list = async function get_category_product_brand_list(req,result) {
  if (req.scl1_id ==0) {
    var brand_list = "select pm.brand,br.brandname from ProductMaster as pm left join Brand br on br.id=pm.brand left join SubcategoryL1 sub on sub.scl1_id=pm.scl1_id left join Category cat on cat.catid=sub.catid where cat.catid= "+req.catid+"  group by  pm.brand ";
  
  }else{
      var brand_list = "select pm.brand,br.brandname from ProductMaster as pm left join Brand br on br.id=pm.brand left join SubcategoryL1 sub on sub.scl1_id=pm.scl1_id left join Category cat on cat.catid=sub.catid where cat.catid= "+req.catid+" and  pm.scl1_id= "+req.scl1_id+"  group by  pm.brand ";
  
  }
    // console.log(brand_list)
    sql.query(brand_list,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
       
  
    
        let resobj = {
          success: true,
          status:true,
          title :"brand List",
          result: res
        };
        result(null, resobj);
      }
    });
  };

ProductMaster.get_collection_brand_list = async function get_collection_brand_list(req,result) {
  var get_collection = await query("select * from  Collections where cid='"+req.cid+"'");
  // var brand_list = await query("select * from Brand where brandname = '"+get_collection[0].product_name+"' ");

  // var query1 = "";
  // if (req.scl1_id !=0) {
  //    query1 = "and  pm.scl1_id='"+req.scl1_id+"'  group by  pm.brand ";
  // }else{
  //   query1 = "group by  pm.brand";
  // }

  // var brand_list_query = " select pm.brand,br.brandname from ProductMaster as pm left join Brand br on br.id=pm.brand left join Product_live pl on pl.pid=pm.pid  where pl.live_status=1 and pm.brand='"+brand_list[0].id+"' "+query1+" ";
  var brand_list_query="";
  console.log(get_collection[0].classification_type)
  if(get_collection[0].classification_type==1){ 
    var brand_list_query = "select br.id as brand,br.brandname from Brand as br where br.id='"+get_collection[0].classification_id+"' group by  br.id";
  }else if(get_collection[0].classification_type==2){
    var brand_list_query = "select br.id as brand,br.brandname from Brand as br left join ProductMaster as pm on pm.brand=br.id left join SubcategoryL1  as sub1 on sub1.scl1_id=pm.scl1_id left join Category as ca on ca.catid=sub1.catid where ca.catid='"+get_collection[0].classification_id+"' group by br.id";
  }else if(get_collection[0].classification_type==3){
    var brand_list_query = "select br.id as brand,br.brandname from Brand as br left join ProductMaster as pm on pm.brand=br.id left join SubcategoryL1  as sub1 on sub1.scl1_id=pm.scl1_id where sub1.scl1_id='"+get_collection[0].classification_id+"' group by br.id";
  }else if(get_collection[0].classification_type==4){
    var brand_list_query = "select br.id as brand,br.brandname from Brand as br left join ProductMaster as pm on pm.brand=br.id left join SubcategoryL2  as sub2 on sub2.scl2_id=pm.scl2_id where sub2.scl2_id='"+get_collection[0].classification_id+"' group by br.id";
  }else if(get_collection[0].classification_type==5){
    var brand_list_query = "select br.id as brand,br.brandname from Collection_mapping_product cmp left join Product_live pl on pl.pid=cmp.pid left join ProductMaster as pm on pm.pid=pl.pid  left join Brand br on pm.brand=br.id  where cmp.cid='"+get_collection[0].cid+"'  and pl.live_status=1 and cmp.active_status=1 group by br.id";
  }else if(get_collection[0].classification_type==6){
    var brand_list_query = "select br.id as brand,br.brandname from Brand as br left join ProductMaster as pm on pm.brand=br.id left join SubcategoryL2  as sub2 on sub2.scl2_id=pm.scl2_id where pm.mrp BETWEEN  '"+get_collection[0].start_price+"' and '"+get_collection[0].end_price+"'  group by br.id";
  }

   console.log(brand_list_query);
  sql.query(brand_list_query,async function(err, res) {
    if (err) {
      result(err, null);
    } else {  
      let resobj = {
        success: true,
        status:true,
        title :"brand List",
        result: res
      };
      result(null, resobj);
    }
  });
};


ProductMaster.get_sort_list = async function get_sort_list(req,result) {  
  res = [{
            "sortid": 1,
            "sortname": "A-Z"
        },
        {
          "sortid": 2,
          "sortname": "Z-A"
       },
        {
            "sortid": 3,
            "sortname": "Price Low - High"
         }
         ,
        {
            "sortid": 4,
            "sortname": "Price High -Low"
        },        
    ]
  let resobj = {
    success: true,
    status:true,
    title :"Sort List",
    result: res
  };
  result(null, resobj);   
};

module.exports = ProductMaster;