"user strict";
var sql = require("../db.js");
const util = require('util');
var constant = require('../constant.js');
var request = require('request');
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var moment = require("moment");
var Collection = require("../../model/common/collectionModel");

const query = util.promisify(sql.query).bind(sql);


var Category = function(category) {
  this.name = category.name;
  this.image = category.image;
};

Category.get_category_list =async function get_category_list(req,result) {
  
  var radiuslimit         = constant.radiuslimit;
  var servicable_status = true;
  var userdetails       = await query("select * from User as us left join Cluster_user_table as uc on uc.userid=us.userid where us.userid = "+req.userid+" ");
  
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


//var category_query= "select ca.catid,ca.name,ca.image from Category ca left join Usercluster_category uc on uc.catid=ca.catid where uc.enable=1 and uc.userclusterid="+userdetails[0].userclusterid+" order by uc.positions ";
  
// var category_query= "select ca.catid,ca.name,ca.image from Category ca left join Cluster_Category_mapping as ccm on ccm.catid=ca.catid left join SubcategoryL1  as sub1 on sub1.catid=ca.catid left join ProductMaster as pm on pm.scl1_id=sub1.scl1_id where ca.active_status=1 and ccm.active_status=1 and sub1.active_status=1 and ccm.cluid='"+userdetails[0].cluid+"' group by ca.catid order by ccm.orderby_category";
var category_query= "select ca.catid,ca.name,ca.image as header_image,ca.thumbimage as image from Category ca left join Cluster_Category_mapping as ccm on ccm.catid=ca.catid left join SubcategoryL1  as sub1 on sub1.catid=ca.catid left join Zone_l1_subcategory_mapping as zl1sub on zl1sub.master_l1_subcatid=sub1.scl1_id left join ProductMaster as pm on pm.scl1_id=sub1.scl1_id left join Product_live as pl on pl.pid=pm.pid left join Zone_category_mapping as zcm on zcm.master_catid=ca.catid where zcm.active_status=1 and ccm.active_status=1  and ccm.cluid='"+userdetails[0].cluid+"' and pl.live_status=1 and zl1sub.active_status=1 and zl1sub.zoneid='"+get_nearby_zone[0].id+"' and zl1sub.zoneid='"+get_nearby_zone[0].id+"' and pl.zoneid='"+get_nearby_zone[0].id+"' and zcm.zoneid='"+get_nearby_zone[0].id+"' group by ca.catid order by ccm.orderby_category";
sql.query(category_query, function(err, res) {
  if (err) {
    result(err, null);
  } else {

    for (let i = 0; i < res.length; i++) {
   
      res[i].servicable_status=servicable_status;
      res[i].category=true,
      res[i].clickable= true
      res[i].collection_status= false
      res[i].tile_type= 1
      //tile_type - 1 or 2   ( 1 means - portrait, 2 means - landscape )
    }


    Collection.list_all_active_collection(req,async function(err,res3) {
      if (err) {
        result(err, null);
      } else {
      
     
          // console.log(res3.status);
          if (res3.status==true) {
            var collectionlist        = {};
            collectionlist.collection = res3.collection;

           
            var collection       = collectionlist.collection;

            const potrate_collectionlist    = collection.filter(collection => collection.tile_type < 2);
            const landscape_collectionlist  = collection.filter(collection => collection.tile_type > 1);

            for (let i = 0; i < potrate_collectionlist.length; i++) {
              
              potrate_collectionlist[i].category=true;
              potrate_collectionlist[i].collection_status= true;
              potrate_collectionlist[i].catid = potrate_collectionlist[i].cid;
              potrate_collectionlist[i].servicable_status=servicable_status;    
              
            }




            res = res.concat(potrate_collectionlist); 
            var temp1 = 0

            if (landscape_collectionlist.length !=0) {
              landscape_collectionlist.sort((a, b) => parseFloat(a.category_Position) - parseFloat(b.category_Position));
              landscape_collectionlist.forEach(i => {
              
                // console.log(i.cid);
                temp1 = temp1 + 4
                // console.log("temp1",temp1);
                i.category=true,
                // i.collection_status= true
    
                i.catid = i.cid;
                i.servicable_status=servicable_status;
                // i.tile_type= 2
                      
                res.splice(temp1, 0, i);
                temp1 = temp1+1
                console.log("temp1",temp1);
              });
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
            header_content:"Hi <b>"+userdetails[0].name+"</b>,<br> What can we get you for tomorrow?",
            header_subconent :"Order or Subscribe before 12 midnight and get it before 12 noon!",
            category_title :"Categories",
            result: res
          };
          result(null, resobj);
         
                              

       
      }
    });


  }
});
}
};


Category.get_category_list_v2 =async function get_category_list_v2(req,result) {
  
    var radiuslimit         = constant.radiuslimit;
    var servicable_status = true;
    var userdetails       = await query("select * from User as us left join Cluster_user_table as uc on uc.userid=us.userid where us.userid = "+req.userid+" ");
    
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


  //var category_query= "select ca.catid,ca.name,ca.image from Category ca left join Usercluster_category uc on uc.catid=ca.catid where uc.enable=1 and uc.userclusterid="+userdetails[0].userclusterid+" order by uc.positions ";
    
  // var category_query= "select ca.catid,ca.name,ca.image from Category ca left join Cluster_Category_mapping as ccm on ccm.catid=ca.catid left join SubcategoryL1  as sub1 on sub1.catid=ca.catid left join ProductMaster as pm on pm.scl1_id=sub1.scl1_id where ca.active_status=1 and ccm.active_status=1 and sub1.active_status=1 and ccm.cluid='"+userdetails[0].cluid+"' group by ca.catid order by ccm.orderby_category";
  var category_query= "select ca.catid,ca.name,ca.image as header_image,ca.thumbimage as image from Category ca left join Cluster_Category_mapping as ccm on ccm.catid=ca.catid left join SubcategoryL1  as sub1 on sub1.catid=ca.catid left join Zone_l1_subcategory_mapping as zl1sub on zl1sub.master_l1_subcatid=sub1.scl1_id left join ProductMaster as pm on pm.scl1_id=sub1.scl1_id left join Product_live as pl on pl.pid=pm.pid left join Zone_category_mapping as zcm on zcm.master_catid=ca.catid where zcm.active_status=1 and ccm.active_status=1  and ccm.cluid='"+userdetails[0].cluid+"' and pl.live_status=1 and zl1sub.active_status=1 and zl1sub.zoneid='"+get_nearby_zone[0].id+"' and zl1sub.zoneid='"+get_nearby_zone[0].id+"' and pl.zoneid='"+get_nearby_zone[0].id+"' and zcm.zoneid='"+get_nearby_zone[0].id+"' group by ca.catid order by ccm.orderby_category";
  sql.query(category_query,async function(err, res) {
    if (err) {
      result(err, null);
    } else {

      for (let i = 0; i < res.length; i++) {
     
        res[i].servicable_status=servicable_status;
        res[i].category=true,
        res[i].clickable= true
        res[i].collection_status= false
        res[i].tile_type= 1
        res[i].type= 1 // category
        res[i].show_video= false;
        //tile_type - 1 or 2   ( 1 means - portrait, 2 means - landscape )
      }

      var get_community = [{
        "comid": 1,
        "communityname": "Soundarya Apartment",
        "lat": "13.0418",
        "long": "80.2341",
        "apartmentname": "Soundarya Apartment",
        "image": "https://dailylocally.s3.amazonaws.com/upload/moveit/1599494008474-Home%20-%20DLE.jpg",
        "created_at": "2020-08-25 15:41:42",
        "status": 0,
        "requested_userid": null,
        "zoneid": 1,
        "no_of_apartments": null,
        "flat_no": null,
        "floor_no": null,
        "community_address": null,
        "area": null,
        "servicable_status": false,
        "category": true,
        "clickable": true,
        "collection_status": false,
        "tile_type": 1,
        "catid": 1,
        "type": 3,
        "approval_status": true,
        "join_status": true,
        "show_video":true
    }];


      var get_community_list = await query("select * from Community  where requested_userid='"+req.userid+"' and  request_type = 1 and status < 2 order by comid desc limit 1");
      var get_join_community= await query("select co.*,jc.* from join_community jc left join Community co on co.comid=jc.comid where  jc.userid='"+req.userid+"' and jc.status =1");
    // console.log("get_community_list",get_join_community.length);

      if (get_join_community.length !=0) {
        
        // console.log("test");
        get_join_community.forEach(i => {
              
         
          i.image= "https://dailylocally.s3.amazonaws.com/upload/moveit/1599494008474-Home%20-%20DLE.jpg";
          i.servicable_status=servicable_status;
          i.category=true,
          i.clickable= true;
          i.collection_status= false
          i.tile_type= 1;
          i.category=true;
          i.catid = i.comid;
          i.type= 3;
          i.show_video=true;
          // i.approval_status= true;
          // i.join_status= true;
         
          // console.log(i);
          if (i.status==1) {
            i.approval_status= true;
            i.join_status= true;
          }else{
            i.approval_status= false;
            i.join_status= true;
            res.splice(0, 0, i);
          }     
          
         
        });


     
      }else{

        if (get_community_list.length !=0) {
          // console.log("test1");
          // console.log("get_community",get_community.length);
          get_community_list.forEach(i => {
            
            if (i.status==1) {
              i.approval_status= true;
              i.join_status= true;
            }else{
              i.approval_status= false;
              i.join_status= true;
            }

            i.image= "https://dailylocally.s3.amazonaws.com/upload/moveit/1599494008474-Home%20-%20DLE.jpg";
            i.servicable_status=servicable_status;
            i.category=true,
            i.clickable= true;
            i.collection_status= false
            i.tile_type= 1;
            i.category=true;
            i.catid = 0;
            i.type= 3;
            i.show_video=true;
            // i.approval_status= false;
            // i.join_status= false;
            // console.log("22222",i);
                  
            res.splice(0, 0, i);
           
          });
        }else{
          get_community.forEach(i => {
            
            // console.log("test3");
              i.approval_status= false;
              i.join_status= false;
            i.servicable_status=servicable_status;
            i.category=true,
            i.clickable= true;
            i.collection_status= false
            i.tile_type= 1;
            i.category=true;
            i.catid = 0;
            i.type= 3;
            i.show_video=true;
            // i.approval_status= false;
            // i.join_status= false;

                  
            res.splice(0, 0, i);
           
          });
        }

      }

      Collection.list_all_active_collection(req,async function(err,res3) {
        if (err) {
          result(err, null);
        } else {
        
       
          //  console.log(res3.status);
            if (res3.status==true) {
              var collectionlist        = {};
              collectionlist.collection = res3.collection;

             
              var collection       = collectionlist.collection;

              const potrate_collectionlist    = collection.filter(collection => collection.tile_type < 2);
              const landscape_collectionlist  = collection.filter(collection => collection.tile_type > 1);


              // console.log(collection.length);
              // console.log(potrate_collectionlist.length);
              // console.log(landscape_collectionlist.length);
           
              for (let i = 0; i < potrate_collectionlist.length; i++) {
                
                potrate_collectionlist[i].category=true;
                potrate_collectionlist[i].collection_status= true;
                potrate_collectionlist[i].catid = potrate_collectionlist[i].cid;
                potrate_collectionlist[i].servicable_status=servicable_status;  
                potrate_collectionlist[i].type= 2  
                
              }

              // console.log(potrate_collectionlist);
              // var temp = 0
              // potrate_collectionlist.forEach(i => {
                
              //   // console.log(res.length);
              //   // temp = temp +2
              //   i.category=true,
              //   i.clickable= false
              //   i.collection_status= true    
              //   i.catid = i.cid;
              //   i.servicable_status=servicable_status;                     
              //   // res.splice(temp, 0, i);

              // });

              res = res.concat(potrate_collectionlist); 
              var temp1 = 0

              if (landscape_collectionlist.length !=0) {
                landscape_collectionlist.sort((a, b) => parseFloat(a.category_Position) - parseFloat(b.category_Position));
                landscape_collectionlist.forEach(i => {
                
                  // console.log(i.cid);
                  temp1 = temp1 + 4
                  // console.log("temp1",temp1);
                  i.category=true,
                  // i.collection_status= true
      
                  i.catid = i.cid;
                  i.servicable_status=servicable_status;
                  i.type= 2 
                  // i.tile_type= 2
                        
                  res.splice(temp1, 0, i);
                  temp1 = temp1+1
                  // console.log("temp1",temp1);
                });
              }
             

  
          
            } 


            // var get_community = await query("select co.* from Community co left join join_community jc on jc.comid=co.comid where jc.userid='"+req.userid+"' and jc.status=1 and co.status=1");

            
            let resobj = {
              success: true,
              status:true,
              serviceablestatus: servicable_status,
              unserviceable_title:"Sorry! Your area is not serviceable.",
              unserviceable_subtitle :"We are serving in selected areas of Chennai only",
              empty_url:"https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1586434698908-free%20delivery%20collection-03.png",
              empty_content:"Daily Locally",
              empty_subconent :"Daily Locally",
              header_content:"Hi <b>"+userdetails[0].name+"</b>,<br> What can we get you for tomorrow?",
              header_subconent :"Order or Subscribe before 12 midnight and get it before 12 noon!",
              category_title :"Categories",
              result: res
            };
            result(null, resobj);
           
                                

         
        }
      });

      // let resobj = {
      //   success: true,
      //   status:true,
      //   serviceablestatus: servicable_status,
      //   unserviceable_title:"Sorry! Your area is not serviceable.",
      //   unserviceable_subtitle :"We are serving in selected areas of Chennai only",
      //   empty_url:"https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1586434698908-free%20delivery%20collection-03.png",
      //   empty_content:"Daily Locally",
      //   empty_subconent :"Daily Locally",
      //   header_content:"Hi <b>"+userdetails[0].name+"</b>,<br> what can we get you tomorrow morning?",
      //   header_subconent :"Guaranteed one day delivery for orders before 9 PM",
      //   category_title :"Categories",
      //   result: res
      // };
      // result(null, resobj);
    }
  });
}
};


//cart details for ear user
Category.read_a_cartdetails = async function read_a_cartdetails(req,orderitems,subscription,result) {
// console.log("req",req);
  var tempmessage = "";
  var coupon__error_message = "";
  var gst = 0;
  var delivery_charge =constant.deliverycharge;
  var productdetails = [];
  var subscription_product=[];
  var totalamount = 0;
  var product_orginal_price = 0;
  var refund_coupon_adjustment = 0;
  var coupon_discount_amount = 0;
  var isAvaliableItem = true;
  var isAvaliableSubscriptionItem = true;
  var calculationdetails = {};
  var couponstatus = true;
  var isAvaliablekitchen = true;
  var isAvaliablezone = true;
  var day = moment().format("YYYY-MM-DD HH:mm:ss");
  var startdate =  moment().format("YYYY-MM-DD");
  var currenthour  = moment(day).format("HH");
  var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  var dayafertomorrow = moment().add(2, "days").format("YYYY-MM-DD");
  var convenience_charge = 0;
  var product_cost_limit_status = true;
  var product_gst = 0;
  var product_weight = 0;
  var product_total_weight = 0;
  var radiuslimit = constant.radiuslimit;
  var product_discount_price=0;
  var deliverydate_status = true;
  var Subdeliverydate_status = true;
  let delivery_date = [];
  let community_user_status = false;
  let cod_available = false;
 
 

    if (currenthour < 24) {
      var order_delivery_day_message = "Your Order delivery will be Tomorrow 12 pm";
      var order_delivery_day = tomorrow;
    } else {
      var order_delivery_day_message = "Your Order delivery will be day after Tomorrow "+dayafertomorrow
      var order_delivery_day= dayafertomorrow;
    }
  
  // var orderlist = await query("Select * From Orders where userid = '" +req.userid +"' and orderstatus >= 6");
  var ordercount = 0
  var userdetails = await query("Select * From User where userid = '" +req.userid +"'");
  var comunity_userdetails = await query("Select * From join_community where userid = '" +req.userid +"' and status=1");

  if (comunity_userdetails.length !=0) {
    userdetails[0].status=1
    community_user_status = true;
    cod_available = true;
  }else{
    userdetails[0].status=0;    
  }

  if (userdetails.length !==0) {   
  
  
    if (orderitems) {
      for (let i = 0; i < orderitems.length; i++) {
        // const res1 = await query("Select pt.*,cu.cuisinename From Product pt left join Cuisine cu on cu.cuisineid = pt.cuisine where pt.productid = '" +orderitems[i].productid +"'  ");
        
        var res1 = await query("Select pm.*,pl.*,um.name as unit,faa.favid,IF(faa.favid,'1','0') as isfav,br.brandname From ProductMaster as pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom  left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand where pl.vpid = '" +orderitems[i].vpid +"' ");
      
        // console.log("delivery_date",orderitems[i].dayorderdate);
        // delivery_date.push(orderitems[i].dayorderdate);
        // console.log("delivery_date",delivery_date.length);

        if (orderitems[i].dayorderdate) {
          delivery_date.push(orderitems[i].dayorderdate);
        }

        // console.log("delivery_date",delivery_date.length);
        if (res1[0].live_status == 0) {
          // console.log("active_status");
          res1[0].availablity = false;
          // tempmessage = tempmessage + res1[0].Productname + ",";
          tempmessage = "";
          isAvaliableItem = false;
        } else {
          res1[0].availablity = true;
        }
  
        if (res1[0].uom== 1 ||res1[0].uom==7) {
          res1[0].weight = res1[0].weight * 1000;
        }
        
        res1[0].offer='offer';
        res1[0].discount_cost_status=false;
        res1[0].mrp_discount_amout=0;
        if ( res1[0].discount_cost) {
          res1[0].discount_cost_status=true;
          res1[0].mrp_discount_amout = res1[0].mrp - res1[0].discount_cost ;
        }


        var amount = 0;
        ///get amount each product
        amount = res1[0].mrp * orderitems[i].quantity;
        // console.log("amount",amount);
        product_discount_price = res1[0].discount_cost * orderitems[i].quantity;
       
        amount =  amount - product_discount_price;
    
        product_weight  = res1[0].Weight * orderitems[i].quantity;
        // product_gst = Math.round((amount / 100) * res1[0].gst );
      
        
        res1[0].amount = amount;
        res1[0].cartquantity = orderitems[i].quantity;
        res1[0].product_weight = product_weight;
        res1[0].product_discount_price = product_discount_price;
        res1[0].no_of_deliveries = 1;
        res1[0].subscription = 0;
      
        totalamount = totalamount + amount;
        // gst = gst + product_gst;
        product_total_weight = product_total_weight + product_weight;


        if (orderitems[i].dayorderdate) {
          
          res1[0].deliverydate=orderitems[i].dayorderdate;


          if ( res1[0].deliverydate <= startdate) {
            deliverydate_status = false
         
          } else {
          
      
            // console.log( moment(orderitems[i].dayorderdate).format("YYYY-MM-DD"));
            res1[0].deliverydate= orderitems[i].dayorderdate
             
          }

        }else{
          if (currenthour <=24) {
    
            res1[0].deliverydate = tomorrow;
               delivery_date.push( res1[0].deliverydate);
          } else {
            
            res1[0].deliverydate= dayafertomorrow;
             delivery_date.push( res1[0].deliverydate);
          }

        }
        
    
        // console.log(currenthour)
        if (currenthour < 24) {
          res1[0].starting_date = tomorrow
        } else {
          res1[0].starting_date = dayafertomorrow;
        }

        productdetails.push(res1[0]);

      
      }


      const uniqueSet = new Set(delivery_date);

      delivery_date = [...uniqueSet]
 
 
      for (let i = 0; i < delivery_date.length; i++) {
 
       date= delivery_date[i]
      //  date= i; 
    
       var dayorderdetails = await query("Select * From Dayorder where userid = '" +req.userid +"' and date ='"+date+"'  and dayorderstatus < 10");
 
     
       if (dayorderdetails.length !=0) {
        if ( dayorderdetails[0].delivery_charge !=0) {
         delivery_date.splice(i, 1);
        }
         
       }
 
      }
    }

   
   


    if (subscription)  {

      // console.log(cod_available);
        if (subscription !=0) {       
          cod_available=false;
        }
      for (let i = 0; i < subscription.length; i++) {
        // const res1 = await query("Select pt.*,cu.cuisinename From Product pt left join Cuisine cu on cu.cuisineid = pt.cuisine where pt.productid = '" +orderitems[i].productid +"'  ");
        
        var subscription_product_list = await query("Select pm.*,pl.*,um.name as unit,faa.favid,IF(faa.favid,'1','0') as isfav,br.brandname  From ProductMaster as pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand where pl.vpid = '" +subscription[i].vpid +"' ");
    
  
        if (subscription_product_list[0].live_status == 0) {
          // console.log("active_status");
          subscription_product_list[0].availablity = false;
          tempmessage = tempmessage + subscription_product_list[0].Productname + ",";
          isAvaliableSubscriptionItem = false;
        }else if(subscription_product_list[0].subscription == 0) {
     
          subscription_product_list[0].availablity = false;
          tempmessage = tempmessage + subscription_product_list[0].Productname + ",";
          isAvaliableSubscriptionItem = false;
        } else {
          subscription_product_list[0].availablity = true;
        }
  

        if ( subscription_product_list[0].uom== 1 || subscription_product_list[0].uom==7) {
          subscription_product_list[0].weight =  subscription_product_list[0].weight * 1000;
        }
        
        subscription_product_list[0].offer='offer';
        subscription_product_list[0].discount_cost_status=false;
        subscription_product_list[0].mrp_discount_amout=0;
        if (  subscription_product_list[0].discount_cost) {
          subscription_product_list[0].discount_cost_status=true;
          subscription_product_list[0].mrp_discount_amout =  subscription_product_list[0].mrp -  subscription_product_list[0].discount_cost ;
        }

        var amount = 0;
        ///get amount each product
        amount = subscription_product_list[0].mrp * subscription[i].quantity;
       
        product_discount_price = subscription_product_list[0].discount_cost * subscription[i].quantity;
       
        amount =  amount - product_discount_price;
    
        product_weight  = subscription_product_list[0].Weight * subscription[i].quantity;
        // product_gst = Math.round((amount / 100) * subscription_product_list[0].gst );
      
       
       
        // subscription_product_list[0].product_gst = product_gst;
        subscription_product_list[0].cartquantity = subscription[i].quantity;
        subscription_product_list[0].product_weight = product_weight;
        subscription_product_list[0].product_discount_price = product_discount_price;       
        subscription_product_list[0].subscription = 1;
        subscription_product_list[0].deliverydate = tomorrow;
        subscription_product_list[0].starting_date = moment(subscription[i].start_date).format("YYYY-MM-DD") ;
        subscription_product_list[0].mon =  subscription[i].mon ||0;
        subscription_product_list[0].tue =  subscription[i].tue ||0;
        subscription_product_list[0].wed =  subscription[i].wed ||0;
        subscription_product_list[0].thur = subscription[i].thur ||0;
        subscription_product_list[0].fri =  subscription[i].fri ||0;
        subscription_product_list[0].sat =  subscription[i].sat ||0;
        subscription_product_list[0].sun =  subscription[i].sun ||0;

        if ( subscription[i].start_date <= startdate) {
          Subdeliverydate_status = false
       
        }

        if (subscription[i].planid) {

          var getplan=await query("select * from Subscription_plan where spid='"+subscription[i].planid+"' ");
          subscription_product_list[0].no_of_deliveries = getplan[0].numberofdays;
          amount = amount * getplan[0].numberofdays;


          subscription_product_list[0].pkts='pkts';
          // subscription_product_list[0].packet_info = subscription[i].quantity *  subscription_product_list[0].packetsize;
          subscription_product_list[0].packet_info = subscription[i].quantity ;

          // subscription_product_list[0].packet_total_info = (subscription_product_list[0].no_of_deliveries * subscription[i].quantity *  subscription_product_list[0].packetsize);
          subscription_product_list[0].packet_total_info = (subscription_product_list[0].no_of_deliveries * subscription[i].quantity );

          
        }

     
        if (currenthour < 24) {
          subscription_product_list[0].actuall_starting_date = tomorrow
        } else {
          subscription_product_list[0].actuall_starting_date = dayafertomorrow;
        }

        subscription_product_list[0].amount = amount;

        //total product cost
        totalamount = totalamount + amount;
        // gst = gst + product_gst;
        product_total_weight = product_total_weight + product_weight;
      
        subscription_product.push(subscription_product_list[0]);
        
      }
    }

   
    var query1 ="select *, ROUND( 3959 * acos( cos( radians('" +
    req.lat +
    "') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('" +
    req.lon +
    "') ) + sin( radians('" +
    req.lat +
    "') ) * sin(radians(lat)) ) , 2) AS distance from Zone  order by distance asc limit 1";
   
  
    sql.query(query1,async function(err,res2) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
       
        if (res2[0].length==0) {
 
          isAvaliablezone=false;
      
          let resobj = {
            success: true,
            status: false,
            message: "Your Zone is not serviceable"
          };
          result(null, resobj);
        }else{
        
         
          if (res2[0].distance > radiuslimit) {
            isAvaliablezone =false;
          }

              distance=Math.ceil(res2[0].distance * 1.6);   

              if (distance > 5 && distance < 7.5) {
                delivery_charge = delivery_charge + 20;
              }else if(distance >=7.5){
                delivery_charge = delivery_charge + 40;
              }
   
              if (delivery_date.length !=0) {
                delivery_charge = delivery_charge * delivery_date.length;
              }else{
                delivery_charge=0;
              }
       
            
       
          res2[0].isAvaliablezone = isAvaliablezone;
          res2[0].community_user_status=community_user_status;
          res2[0].cod_available=cod_available;
          res2[0].cod_unavailable_info ="Cash on delivery isn't available for subscription orders";
         
          
          product_orginal_price = totalamount;

            //offer coupon amount detection algorithm
          if (req.cid) {
              var couponlist = await query("Select * From Coupon where cid = '" +req.cid +"' and active_status = 1 and expiry_date >= CURDATE()" );
          
              if (couponlist.length != 0) {
                var maxdiscount = couponlist[0].maxdiscount;
                var numberoftimes = couponlist[0].numberoftimes;
                var discount_percent = couponlist[0].discount_percent;
                var minprice_limit = couponlist[0].minprice_limit;
                var coupon_name = couponlist[0].coupon_name || '';
                var CouponsUsedlist = await query("Select * From CouponsUsed where cid = '" +req.cid +"' and userid = '" +req.userid +"' and active_status = 1");
                var couponusedcount = CouponsUsedlist.length;

                if (totalamount >=minprice_limit) {                
                  minprice_limit_status = true
                  if (couponusedcount < numberoftimes) {                
                    var discount_amount = (totalamount / 100) * discount_percent;
                    discount_amount = Math.round(discount_amount);                            
                    if (discount_amount >= maxdiscount) {
                      discount_amount = maxdiscount;
                    }

                    if (totalamount >= discount_amount) {                  
                      totalamount = totalamount - discount_amount;
                      coupon_discount_amount = discount_amount;
                    }else{
                      couponstatus = false;
                      coupon__error_message = "coupon amount is too high";
                    }
                  }else{
                    couponstatus = false;
                    coupon__error_message = "coupon has been expired";
                  }
                }else{
                  couponstatus = false;
                  coupon__error_message = "Product value should be "+ minprice_limit+" to apply this coupons " ;
                }
              }else{
                couponstatus = false;
                coupon__error_message = "Coupon is not available";
              }
          }
          
           if (userdetails[0].status==1) {
          delivery_charge = 0;//if false don't show message           
        }

         var gstcharge = (delivery_charge / 100) * constant.gst;
         gstcharge = Math.round(gstcharge);
        

        
        
       var grandtotal = gstcharge + totalamount + delivery_charge + convenience_charge;
          // console.log("delivery_charge",delivery_charge);

          if (grandtotal < constant.minimum_cart_value) {
            product_cost_limit_status = false;//if false don't show message an 
            
          }
          
          if (userdetails[0].premium_user==1  ||  userdetails[0].status==1) {
            product_cost_limit_status = true;//if false don't show message           
          }

          /////Premum user 
          
          calculationdetails.grandtotaltitle = "To Pay";
          calculationdetails.grandtotal = grandtotal;
          calculationdetails.gstcharge = gstcharge;
          calculationdetails.product_total_weight=product_total_weight
          calculationdetails.delivery_charge = delivery_charge;
          calculationdetails.refund_coupon_adjustment = refund_coupon_adjustment;
          calculationdetails.product_orginal_price = product_orginal_price;
          calculationdetails.totalamount = totalamount;
          calculationdetails.coupon_discount_amount = coupon_discount_amount;
          calculationdetails.couponstatus = false;
          calculationdetails.coupon_name = coupon_name;
          calculationdetails.product_cost_limit_status = product_cost_limit_status;
          calculationdetails.product_cost_limit_message = constant.product_cost_limit_message;
          calculationdetails.product_cost_limit_short_message = constant.product_cost_limit_short_message+constant.minimum_cart_value;
          calculationdetails.order_delivery_day_message = order_delivery_day_message;
          calculationdetails.order_delivery_day = order_delivery_day;
          calculationdetails.minimum_cart_value = constant.minimum_cart_value;
          calculationdetails.show_delivery_text = false;
          calculationdetails.delivery_text ="Delivery charges";
           calculationdetails.community_delivery_charge  = "Free";
          calculationdetails.exclusive_tag   = "DAILY LOCALLY EXCLUSIVE";

          if (community_user_status==true || userdetails[0].premium_user==1 ) {
            calculationdetails.show_delivery_text=true
         
          }

          //  console.log(calculationdetails.order_delivery_day);
          if (req.cid && couponstatus) {
            calculationdetails.couponstatus = couponstatus;
            calculationdetails.cid = req.cid;
          }
         

          var cartdetails = [];
          var totalamountinfo = {};
          var couponinfo = {};
          var gstinfo = {};
          var deliverychargeinfo = {};
          var other_charges_info = {};
          deliverychargeinfo.low_cost_status=false//show low cost 30
          deliverychargeinfo.default_cost_status = false;//default cost 30
          deliverychargeinfo.infostatus = true;
          deliverychargeinfo.infodetails = [];

          //var grandtotalinfo = {};

          totalamountinfo.title = "Total Amount";
          totalamountinfo.charges = product_orginal_price;
          totalamountinfo.status = true;
          totalamountinfo.infostatus = false;
          totalamountinfo.color_code = "#ff444444";
          totalamountinfo.low_cost_status = false;
          totalamountinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
          totalamountinfo.default_cost=constant.convenience_charge;
          totalamountinfo.default_cost_status=false;
          totalamountinfo.infodetails = [];            
          cartdetails.push(totalamountinfo);

          if (req.cid && couponstatus) {
            couponinfo.title = "Discount (-)";
            couponinfo.charges = coupon_discount_amount;
            couponinfo.status = true;
            couponinfo.infostatus = false;
            couponinfo.color_code = "#129612";
            couponinfo.low_cost_status = false;
            couponinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
            couponinfo.default_cost=constant.convenience_charge;
            couponinfo.default_cost_status=false;
            couponinfo.infodetails = [];
            cartdetails.push(couponinfo);
          }

          if (gstcharge !==0) {
            gstinfo.title = "Taxes ";//gst modified taxes 13-jan-2020
          gstinfo.charges = gstcharge;
          gstinfo.status = true;
          gstinfo.infostatus = false;
          gstinfo.color_code = "#ff444444";
          gstinfo.low_cost_status = false;
          gstinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
          gstinfo.default_cost=constant.convenience_charge;
          gstinfo.default_cost_status=false;
          gstinfo.infodetails = [];
          cartdetails.push(gstinfo);
          }
          

          // //this code is modified 23-09-2019
          if (delivery_charge !==0) {
           
            deliverychargeinfo.title = "Delivery charge";
            deliverychargeinfo.charges = delivery_charge;
            deliverychargeinfo.status = true;
            cartdetails.push(deliverychargeinfo);
          }    
          
          if (delivery_charge!==0) {      
            other_charges_info.name="Delivery charge";
            other_charges_info.price=delivery_charge;
            deliverychargeinfo.infodetails.push(other_charges_info);
          }

         

        
          res2[0].amountdetails = calculationdetails;
          res2[0].item = productdetails;
          res2[0].subscription_item = subscription_product;
          res2[0].ordercount = ordercount;
          res2[0].cartdetails = cartdetails;
          res2[0].minimum_cart_value = constant.minimum_cart_value;
         

          let resobj = {
            success: true,
            status: isAvaliableItem,
            distance:distance,
          };
            
          if(!couponstatus){
            resobj.message = coupon__error_message;
            resobj.status = couponstatus
          }

          
          if (!isAvaliableItem){
            // resobj.message = tempmessage.slice(0, -1) + " Some items in your cart have gone out of stock. kindly remove them or look for an alternative !";
            resobj.message = tempmessage.slice(0, -1) + " Some items in your cart have gone out of stock. kindly remove them or look for an alternative !";
            resobj.status = isAvaliableItem
          }
          if (!isAvaliableSubscriptionItem){
            resobj.message = tempmessage.slice(0, -1) + " not  available Subscription !";
            resobj.status = isAvaliableSubscriptionItem
          }


          if (!isAvaliablezone){
            resobj.message = " Your order cannot be placed as your current address is not serviceable. change address to continue";
            resobj.status = isAvaliablezone
          }
          if (!product_cost_limit_status){
            resobj.message = constant.product_cost_limit_short_message+constant.minimum_cart_value;
            resobj.status = product_cost_limit_status;
            resobj.product_cost_limit_status=product_cost_limit_status;
          }

          if (!deliverydate_status) {
            resobj.message = "Please select feature date";
            resobj.status = deliverydate_status
          }

          if (!Subdeliverydate_status) {
            resobj.message = "Please select feature date on Subscription";
            resobj.status = Subdeliverydate_status
          }
          resobj.product_cost_limit_status=product_cost_limit_status;

          resobj.result = res2; 
          result(null, resobj);
      
          
      } 
      }
    });

  

    
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "user is not found"
    };
    result(null, resobj);
  } 
};


//cart details for ear user
Category.subscribeplan_by_pid = async function subscribeplan_by_pid(req,result) {
  var tempmessage = "";
  var isAvaliableItem = true;
  var planStatus = true;
  var subscription_product = [];
  var userdetails = await query("Select * From User where userid = '" +req.userid +"'");

  if (userdetails.length !==0) {   

   
    if (req.vpid ) {

        
        var subscription_product_list = await query("Select pm.*,pl.*,um.name as unit,if(pm.uom=1 || pm.uom=7,pm.weight*1000,pm.weight) as  weight From ProductMaster as pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom where pl.vpid = '" +req.vpid +"' ");
        if (subscription_product_list[0].live_status == 0) {
          subscription_product_list[0].availablity = false;
          tempmessage = tempmessage + subscription_product_list[0].Productname + ",";
          isAvaliableItem = false;
        }else if (subscription_product_list[0].subscription == 0) {
     
          subscription_product_list[0].availablity = false;
          tempmessage = tempmessage + subscription_product_list[0].Productname + ",";
          isAvaliableItem = false;
        } else {
          subscription_product_list[0].availablity = true;
        }


   
     
        // subscription_product_list[0].weight = subscription_product_list[0].weight * 1000;
        subscription_product_list[0].offer='offer';
        subscription_product_list[0].discount_cost_status=false;
        subscription_product_list[0].mrp_discount_amout=0;
          if ( subscription_product_list[0].discount_cost) {
            subscription_product_list[0].discount_cost_status=true;
            subscription_product_list[0].mrp_discount_amout = subscription_product_list[0].mrp - subscription_product_list[0].discount_cost ;
          }
          
  

      
        subscription_product.push(subscription_product_list[0]);
        

    }
   
    var query1 ="select * from Subscription_plan where active_status=1";
   
  
    sql.query(query1,async function(err,res2) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
       
       
        if (res2.length==0) {
          planStatus = false;
        }

        //  res2[0].subscription_product = subscription_product;

         

          let resobj = {
            success: true,
            };
            
        
          if (!isAvaliableItem){
            resobj.message = tempmessage.slice(0, -1) + " not  available Subscription !";
            resobj.status = isAvaliableItem
          }

          if (!planStatus){
       
            resobj.message = tempmessage.slice(0, -1) + " Subscription Plan not available!";
            resobj.status = planStatus
          }

          resobj.subscription_plan= res2;
          resobj.result = subscription_product; 
          result(null, resobj);
                
      } 

    });

  


    
    
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "user is not found"
    };
    result(null, resobj);
  } 
};

//cart details for ear user
Category.get_dayorder_date = async function get_dayorder_date(req,result) {
  var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  var dayafertomorrow = moment().add(2, "days").format("YYYY-MM-DD");
  var userdetails = await query("Select * From User where userid = '" +req.userid +"'");
  var order_delivery_day_message= '';
  var order_delivery_day='';
  var currenthour  = moment(day).format("HH");
  var day = moment().format("YYYY-MM-DD HH:mm:ss");
  if (userdetails.length !==0) {   

   
   
    if (currenthour < 24) {
       order_delivery_day_message = "Your Order delivery will be Tomorrow 12 pm";
       order_delivery_day = tomorrow;
    } else {
       order_delivery_day_message = "Your Order delivery will be day after Tomorrow "+dayafertomorrow
       order_delivery_day= dayafertomorrow;
    }
  
    let resobj = {
      success: true,
      status: true,
      order_delivery_day: order_delivery_day
    };
    result(null, resobj);

    
    
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "user is not found"
    };
    result(null, resobj);
  } 
};

//cart details for ear user
Category.subscribeplan_totalamount_by_pid = async function subscribeplan_totalamount_by_pid(req,result) {
  var tempmessage = "";
  var isAvaliableItem = true;
  var planStatus = true;
  var subscription_product = [];
  var userdetails = await query("Select * From User where userid = '" +req.userid +"'");

  if (userdetails.length !==0) {   

   
    if (req.vpid ) {

        
        var subscription_product_list = await query("Select pm.*,pl.*,um.name as unit  From ProductMaster as pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom where pl.vpid = '" +req.vpid +"' ");
        if (subscription_product_list[0].live_status == 0) {
          subscription_product_list[0].availablity = false;
          tempmessage = tempmessage + subscription_product_list[0].Productname + ",";
          isAvaliableItem = false;
        }else if (subscription_product_list[0].subscription == 0) {
     
          subscription_product_list[0].availablity = false;
          tempmessage = tempmessage + subscription_product_list[0].Productname + ",";
          isAvaliableItem = false;
        } else {
          subscription_product_list[0].availablity = true;
        }


        var amount = 0;
        ///get amount each product
        amount = subscription_product_list[0].mrp * req.quantity;
       
        product_discount_price = subscription_product_list[0].discount_cost * req.quantity;
       
        amount =  amount - product_discount_price;
    
        product_weight  = subscription_product_list[0].Weight * req.quantity;
        // product_gst = Math.round((amount / 100) * subscription_product_list[0].gst );
      
       
       
        // subscription_product_list[0].product_gst = product_gst;
        subscription_product_list[0].cartquantity = req.quantity;
        subscription_product_list[0].product_weight = product_weight;
        subscription_product_list[0].product_discount_price = product_discount_price;       
        subscription_product_list[0].subscription = 1;
      

        if (req.planid) {

          console.log(req.planid);
          var getplan=await query("select * from Subscription_plan where spid='"+req.planid+"' ");
          subscription_product_list[0].no_of_deliveries = getplan[0].numberofdays;
          amount = amount * getplan[0].numberofdays;
          subscription_product_list[0].pkts='pkts';
          // subscription_product_list[0].packet_info = req.quantity *  subscription_product_list[0].packetsize;

          console.log("req.quantity",req.quantity );
          subscription_product_list[0].packet_info = req.quantity ;
          // subscription_product_list[0].packet_total_info = (subscription_product_list[0].no_of_deliveries * req.quantity *  subscription_product_list[0].packetsize);
          subscription_product_list[0].packet_total_info = (subscription_product_list[0].no_of_deliveries * req.quantity );
        }


        subscription_product_list[0].amount = amount;

      
        subscription_product.push(subscription_product_list[0]);
        

    }
   
    var query1 ="select * from Subscription_plan where active_status=1";
   
  
    sql.query(query1,async function(err,res2) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
       
       
        if (res2.length==0) {
          planStatus = false;
        }

        //  res2[0].subscription_product = subscription_product;

         

          let resobj = {
            success: true,
            status:true
            };
            
        
          if (!isAvaliableItem){
            resobj.message = tempmessage.slice(0, -1) + " not  available Subscription !";
            resobj.status = isAvaliableItem
          }

          if (!planStatus){
       
            resobj.message = tempmessage.slice(0, -1) + " Subscription Plan not available!";
            resobj.status = planStatus
          }

        //  / resobj.subscription_plan= res2;
          resobj.result = subscription_product; 
          result(null, resobj);
      
          
      } 

    });

  


    
    
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "user is not found"
    };
    result(null, resobj);
  } 
};


Category.get_collection_category_list = async function get_collection_category_list(req,result) {
  
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


  var category_query = "select cat.* from Collection_mapping_product as cmp left join ProductMaster as pm on pm.pid=cmp.pid  left join SubcategoryL1 as sub1 on sub1.scl1_id=pm.scl1_id  left join Category cat on cat.catid=sub1.catid where cmp.cid='"+req.cid+"' group by cat.catid  ";

sql.query(category_query,async function(err, res) {
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
      category_title :"Sub_Categories_L1",
      result: res
    };
    result(null, resobj);
  }
});
}
};

module.exports = Category;