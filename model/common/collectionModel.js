"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var constant = require('../constant.js');
var ZoneModel = require('../common/zoneModel');

var Collection = function(collection) {
  this.name = collection.name;
  this.active_status = collection.active_status;
  this.query = collection.query;
  this.img_url = collection.img_url;
}



Collection.list_all_active_collection =async function list_all_active_collection(req,result) {

  var radiuslimit         = constant.radiuslimit;
  var userdetails  = await query("select * from User as us left join Cluster_user_table as uc on uc.userid=us.userid where us.userid = "+req.userid+" ");
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
  if (userdetails.length !==0) {
    userdetails[0].cluid = userdetails[0].cluid || 1;
    var collection_query = "Select cs.cid,cs.name,cs.active_status,cs.img_url as image,cs.category_Position,cs.tile_type,cs.clickable,cs.product_name,cs.classification_type,cs.classification_id from Collections as cs left join Cluster_Collection_mapping ccm on ccm.cid=cs.cid where cs.active_status=1 and ccm.cluid='"+userdetails[0].cluid+"' group by cs.cid";
    
    sql.query(collection_query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
      
        //  console.log("res",res.length);
        for (let i = 0; i < res.length; i++) {
        
          if (res[i].clickable=1) {
            res[i].clickable=true;
          } else {
            res[i].clickable=false;
          }

          // console.log("res[i].classification_type",res[i].classification_type);
          if (res[i].classification_type==1) { 
            //brand
           product_query = "select pm.*,pl.*  from  ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join Brand br on br.id=pm.brand  where br.id = '"+res[i].classification_id+"' and pl.live_status=1"
           
          var productlist = await query(product_query);
          }else if(res[i].classification_type==2){
             //category
            product_query = "select pm.*,pl.*  from Category ca left join Cluster_Category_mapping as ccm on ccm.catid=ca.catid left join SubcategoryL1  as sub1 on sub1.catid=ca.catid left join Zone_l1_subcategory_mapping as zl1sub on zl1sub.master_l1_subcatid=sub1.scl1_id left join ProductMaster as pm on pm.scl1_id=sub1.scl1_id left join Product_live as pl on pl.pid=pm.pid left join Zone_category_mapping as zcm on zcm.master_catid=ca.catid where zcm.active_status=1 and ccm.active_status=1  and ccm.cluid='"+userdetails[0].cluid+"' and pl.zoneid='"+get_nearby_zone[0].id+"' and pl.live_status=1 and ca.catid='"+res[i].classification_id+"'  order by ccm.orderby_category"
           
            var productlist = await query(product_query);
          }else if(res[i].classification_type==3){
            //sub-category 1
            product_query = "Select pm.*,pl.* from SubcategoryL1 as  l1 left join ProductMaster pm on pm.scl1_id=l1.scl1_id  left join  Product_live pl on pl.pid=pm.pid left join Category  as ca on l1.catid=ca.catid left join Zone_l1_subcategory_mapping zl1 on zl1.master_l1_subcatid =l1.scl1_id where  pl.live_status=1 and zl1.zoneid='"+get_nearby_zone[0].id+"' and l1.scl1_id=  '"+res[i].classification_id+"'  "
           
            var productlist = await query(product_query);
          }else if(res[i].classification_type==4){
            //sub-category 2
            product_query = "Select pm.*,pl.*  from SubcategoryL2 as  l2 left join ProductMaster pm on pm.scl2_id=l2.scl2_id  left join  Product_live pl on pl.pid=pm.pid left join Zone_l2_subcategory_mapping zl2 on zl2.master_l2_subcatid =l2.scl2_id left join SubcategoryL1 l1 on l1.scl1_id=l2.scl1_id where l2.scl2_id='"+res[i].classification_id+"'   and pl.live_status=1 and zl2.zoneid='"+get_nearby_zone[0].id+"'"
           
            var productlist = await query(product_query);
          }else if(res[i].classification_type==5){
            //sub-category 2
            product_query = "select * from Collection_mapping_product cmp left join Product_live pl on pl.pid=cmp.pid where cmp.cid= '"+res[i].cid+"'  and pl.live_status=1 group by pl.pid"
           
            var productlist = await query(product_query);
            // console.log("productlist",productlist);
          }else{
            product_query = "select pm.*,br.brandname from  ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join Brand br on br.id=pm.brand  where br.id = '"+res[i].classification_id+"' and pl.live_status=1"
           
            var productlist = await query(product_query);
          }
  
          // console.log("productlist[0]",productlist[0].brand);
     
   
          if (productlist.length !=0) {
            res[i].collection_status = true;
            // console.log(" res[i].collection_status", res[i].name);
          
          }else{
            res[i].collection_status = false;
          }
        }
      
         res  =  res.filter(re => re.collection_status ==true);
        //  console.log(res.length);
      if (res.length != 0 ) {
        
        let resobj = {
          success: true,
          status:true,
          collection: res
        };
        result(null, resobj);
      } else {
        let resobj = {
          success: true,
          status: false,
          message: "Sorry there no active collections"
        };
        result(null, resobj);
       } 
        
           
      }
    });
  } else {
    let resobj = {
      success: true,
      status:false,
      message: "user not found"
    };
    result(null, resobj);
  }
 
};

Collection.getcollectionlist = async function getcollectionlist(res2,req,result){
  var userdetails = await query("Select * From User where userid = '" +req.userid +"'");

  for (let i = 0; i < res2.length; i++) {

    req.cid = res2[i].cid;   
    req.query = res2[i].query;
    
    await Collection.get_all_collection_by_cid(req, async function(err,res4) {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        if (res4.status != true) {
          result(null, res4);
        } else {          
       
          // console.log(res3.result);
          var productlist = res4.result
           
        // console.log("productlist",productlist);
          
          if (productlist.length !=0) {
            res2[i].collectionstatus = true;
            console.log("true",productlist.length);
          }else{
            res2[i].collectionstatus = false;
            console.log("false",productlist.length);
          } 
        
          delete res2[i].query;
          // console.log("collectionstatus",res);
        }
      }
    });
  }
  // result res2

  let resobj = {
    success: true,
    status: true,
    result: res2
  };
  result(null, resobj);
}

Collection.get_all_collection_by_cid = async function get_all_collection_by_cid(req,result) {  

    await sql.query(req.query,[req.cid],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {            
        if (res1.length !=0) {
          // console.log(res1); 
          // console.log("------------------------res1",res1.length);              
            let resobj = {
              success: true,
              status: true,
              collection_name:res1[0].name,
              result: res1
            };
            result(null, resobj);
          }else{
            // console.log("------------------------res2",res1.length);   
            let resobj = {
              success: true,
              status: false,
              collection_name:'',
              result: res1
            };
            result(null, resobj);
          }
          }

    });
   
   
   
};


Collection.get_all_collection_by_cid_v2 = async function get_all_collection_by_cid_v2(req,result) {
  

  
  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit = constant.radiuslimit;
  var tunnelkitchenliststatus = true;
  const userdetails = await query("select * from User where userid = "+req.eatuserid+" ");

  if (userdetails[0].first_tunnel == 1 ) {
    
    tunnelkitchenliststatus = false;

  }

   await sql.query("Select * from Collections where active_status= 1 and cid = '"+req.cid+"'", async function(err, res) {
      if (err) {
        result(err, null);
      } else {

     // if (res.length !== 0) {
        
        
        var  productquery = '';
        var  groupbyquery = " GROUP BY pt.makeit_userid";
      //  var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,distance asc";
        var  orderbyquery = " GROUP BY pt.productid ORDER BY mk.rating desc,mk.unservicable = 0 desc";
      
      
        var breatfastcycle = constant.breatfastcycle;
        var dinnercycle = constant.dinnercycle;
        var lunchcycle = constant.lunchcycle;

        var day = moment().format("YYYY-MM-DD HH:mm:ss");;
        var currenthour  = moment(day).format("HH");
        var productquery = "";
       // console.log(currenthour);

        if (currenthour < lunchcycle) {

          productquery = productquery + " and pt.breakfast = 1";
        //  console.log("breakfast");
        }else if(currenthour >= lunchcycle && currenthour < dinnercycle){

          productquery = productquery + " and pt.lunch = 1";
        //  console.log("lunch");
        }else if( currenthour >= dinnercycle){
          
          productquery = productquery + " and pt.dinner = 1";
        //  console.log("dinner");
        }
      

      // //based on logic this conditions will change
      //    if (req.cid == 1 || req.cid == 2 || req.cid == 4 || req.cid == 6 || req.cid == 7) {
      //   var productlist = res[0].query + productquery  + groupbyquery + " ORDER BY mk.unservicable = 0 desc";
      // }else if(req.cid == 3 ) {    ///kitchen
      //   var productlist = res[0].query + productquery  + orderbyquery;
      // }else if(req.cid= 5){
      //   var productlist = res[0].query + productquery+ " GROUP BY mk.userid ORDER BY mk.unservicable = 0 desc,mk.created_at desc limit 10"
      // }
          
      if (res[0].category == 1) {
     
        var productlist = res[0].query + productquery  + groupbyquery + " ORDER BY mk.unservicable = 0 desc";
      }else if(res[0].category == 2) {    ///kitchen
       
        var productlist = res[0].query + productquery  + orderbyquery;
      }

    //   console.log(productlist);
      await sql.query(productlist,[req.lat,req.lon,req.lat,req.eatuserid,req.eatuserid],async function(err, res1) {
        if (err) {
          result(err, null);
        } else {            
          if (res1.length !=0) {
                                
          ////Zone Condition////
          if(constant.zone_control){
            ////Get User Zone////
            var getzone     = await ZoneModel.check_boundaries({lat:req.lat,lon:req.lon});
            var userzoneid  = '';
            var zonename    = '';
            var zonemakeitsrrsy = [];
            if(getzone.zone_id){          
              userzoneid = getzone.zone_id;
              zonename   = getzone.zone_name;
              ////Make Zone Servicable kitchen array////
              var zonemakeitsrrsy = res1.filter(kitchenarray => (kitchenarray.zone==userzoneid && kitchenarray.unservicable==0));
            } 
          }


          for (let i = 0; i < res1.length; i++) {  
                if (res[0].category == 1) {

                  if (res1[i].productlist) {
                    res1[i].productlist =JSON.parse(res1[i].productlist)
                    var arr = res1[i].productlist;
               
                    function getUniqueListBy(arr, key) {
                      return [...new Map(arr.map(item => [item[key], item])).values()]
                   }
                     res1[i].productlist = getUniqueListBy(arr, 'productid')
                  }
                 
                }
                
                res1[i].distance = res1[i].distance.toFixed(2);
                //15min Food Preparation time , 3min 1 km
              //  eta = 15 + 3 * res[i].distance;
                var eta = foodpreparationtime + onekm * res1[i].distance;
                
                // res1[i].serviceablestatus = false;
    
                
                // if (res1[i].distance <= radiuslimit) {
                //   res1[i].serviceablestatus = true;
                // } 

                res1[i].serviceablestatus = false;
                res1[i].status = 1;
  
                if (res1[i].unservicable == 0) {
                  res1[i].serviceablestatus = true;
                  res1[i].status = 0;
                }
                
            
            //////////////Zone Condition//////////
            if(constant.zone_control){
              if (res1[i].serviceablestatus !== false) {
                if(zonemakeitsrrsy.length !=0 && res1[i].zone==userzoneid){
                  res1[i].serviceablestatus = true;
                  res1[i].status = 0;
                }else if (zonemakeitsrrsy.length ==0 && res1[i].distance <= radiuslimit){
                  res1[i].serviceablestatus = true;
                  res1[i].status = 0;
                }else{
                  res1[i].serviceablestatus = false;
                  res1[i].status = 1;
                }
              }
            }else{
              if (res1[i].serviceablestatus !== false) {
                if (res1[i].distance <= radiuslimit) {
                  res1[i].serviceablestatus = true;
                  res1[i].status = 0;
                }else{
                  res1[i].serviceablestatus = false;
                  res1[i].status = 1;
                }
              }
            }

              if (tunnelkitchenliststatus == false) {
                res1[i].status = 0;
                res1[i].serviceablestatus = true;
              }
               
                res1[i].eta = Math.round(eta) + " mins";
                    if (res1[i].cuisines) {
                      res1[i].cuisines = JSON.parse(res1[i].cuisines);
                    }                  
                
              }

              if (req.cid !=11 && req.cid !=23) {
                
                res1.sort((a, b) => parseFloat(a.status) - parseFloat(b.status));
              }else{
               
                res1.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
              }

            

              let resobj = {
                success: true,
                status: true,
                collection_name:res[0].name,
                result: res1
              };
              result(null, resobj);
            }else{
              let resobj = {
                success: true,
                status: false,
                collection_name:res[0].name,
                result: res1
              };
              result(null, resobj);
            }
            }

          });
        // }else{

        //   let resobj = {
        //     success: true,
        //     status: false,
        //     result: res
        //   };
        //   result(null, resobj);


        // }
      }
    });
//};
};



module.exports = Collection;