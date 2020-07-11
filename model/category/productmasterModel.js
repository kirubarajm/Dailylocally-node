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

      var productlimit = 5;
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


    if (!req.scl2_id) {
        req.scl2_id=0;
    }

    // var sub_l2_category_query= "Select * from SubcategoryL2 where scl1_id=  '"+req.scl1_id+"' ";
    var product_list = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand "


    if (brandlist !== undefined) {
      product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and ( pl.live_status=1 and pm.scl2_id='"+req.scl2_id+"' or pm.scl1_id= '"+req.scl1_id+"') and (" +brandquery;
    }else{
      product_list = product_list +" where pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and (pm.scl2_id='"+req.scl2_id+"' or pm.scl1_id= '"+req.scl1_id+"')"
    }

    if (req.sortid==1) {
    
      product_list = product_list+ " ORDER BY pm.Productname ASC limit " +startlimit +"," +productlimit +"";
     
    }else if (req.sortid==2) {

      product_list = product_list+ " ORDER BY pm.mrp ASC limit " +startlimit +"," +productlimit +"";

    }else if (req.sortid==3) {

      product_list = product_list+ " ORDER BY pm.mrp DESC limit " +startlimit +"," +productlimit +"";
    }
    // }else if (req.sortid==5) {

    //   product_list = product_list+ " ORDER BY br.brandname ASC ";

    // }else if (req.sortid==6) {
    //   product_list = product_list+ " ORDER BY br.brandname DESC ";
    // }

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
   
      res[i].weight = res[i].weight * 1000;
      res[i].servicable_status=servicable_status;
      res[i].offer='offer';
      res[i].discount_cost_status=false;
      if ( res[i].discount_cost) {
        res[i].discount_cost_status=true;
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
  
  var radiuslimit         = constant.radiuslimit;
  var servicable_status = true;
  // var userdetails       = await query("select * from User where userid = "+req.userid+" ");
  
  // var sub_l2_category_query= "Select * from SubcategoryL2 where scl1_id=  '"+req.scl1_id+"' ";
  var product_detail = "select dor.*,JSON_ARRAYAGG(JSON_OBJECT('doid',dp.doid,'product_image',dp.product_image,'product_short_desc',dp.product_short_desc,'quantity_info',dp.quantity+'pkts','quantity', dp.quantity,'vpid',dp.vpid,'price',dp.price,'product_name',dp.productname,'product_name',dp.productname,'unit',um.name,'brandname',br.brandname,'weight',pm.weight*1000,'dayorderstatus',dor.dayorderstatus,'Cancel_available',IF(dp.scm_status <=5,true,false),'product_date',IF(dp.scm_status <=5,dor.date,IF(dp.scm_status =10,dp.delivery_date,IF(dp.scm_status =11,dp.product_cancel_time,dor.date))),'scm_status',dp.scm_status,'scm_status_name',IF(dp.scm_status <=5,'inprogress',IF(dp.scm_status =10 ,'Deliverd',IF(dp.scm_status =11 ,'cancelled','Waiting for delivery')))  )) AS items from Orders ors left join Dayorder_products dp on dp.orderid=ors.orderid left join Dayorder dor on dor.id=dp.doid left join Product_live pl on pl.vpid=dp.vpid left join ProductMaster pm on pm.pid=pl.vpid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand  where dp.id='"+req.dayorderpid+"' and dp.doid='"+req.doid+"' group by dp.vpid"

sql.query(product_detail,async function(err, res) {
  if (err) {
    result(err, null);
  } else {


    if (res[0].items) {
     var items = JSON.parse(res[0].items);
       res[0].items = items;
      // res[0].items.quantity_info = items.length +'pkts';
    }




    let resobj = {
      success: true,
      status:true,
      serviceablestatus: servicable_status,
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

  var product_list = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit from ProductMaster pm left join Product_live pl on pl.vpid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join SubcategoryL1 sub1 on sub1.scl1_id=pm.scl1_id left join Collection_mapping_product cmp on cmp.pid=pm.pid ";


  if (req.scl1_id !=0) {
    var product_list = product_list +" where  cmp.cid='"+req.cid+"' and sub1.scl1_id= '"+req.scl1_id+"' ";
  }else{
    var product_list = product_list +" where  cmp.cid='"+req.cid+"' ";
  }



  if (brandlist !== undefined) {
    product_list = product_list +"  and (" +brandquery;
  }

  if (req.sortid==1) {
  
    product_list = product_list+ " ORDER BY pm.Productname ASC ";
   
  }else if (req.sortid==2) {

    product_list = product_list+ " ORDER BY pm.mrp ASC ";

  }else if (req.sortid==3) {

    product_list = product_list+ " ORDER BY pm.mrp DESC ";
  }

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
  
  var brand_list = "select pm.brand,br.brandname from ProductMaster as pm left join Brand br on br.id=pm.brand where pm.scl2_id= "+req.scl2_id+" group by  pm.brand ";
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

  var brand_list = "select pm.brand,br.brandname from Collection_mapping_product cmp left join ProductMaster as pm  on cmp.pid=pm.pid left join Brand br on br.id=pm.brand left join Product_live pl on pl.vpid=pm.pid  where cmp.cid= pl.live_status=1 and (cmp.cid= '"+req.cid+"' or pm.scl1_id='"+req.scl1_id+"') group by  pm.brand ";
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
ProductMaster.get_sort_list = async function get_sort_list(req,result) {
  
res =  [{
            "sortid": 1,
            "sortname": "A-Z"
        },
        {
            "sortid": 2,
            "sortname": "Low - High"
         }
         ,
        {
            "sortid": 3,
            "sortname": "High -Low"
        }
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