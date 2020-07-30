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

  var userdetails  = await query("select * from User as us left join Cluster_user_table as uc on uc.userid=us.userid where us.userid = "+req.userid+" ");

  if (userdetails.length !==0) {
    sql.query("Select cs.cid,cs.name,cs.active_status,cs.img_url as image,cs.category_Position,cs.tile_type from Collections as cs left join Cluster_Collection_mapping ccm on ccm.cid=cs.cid  join Collection_mapping_product cmp on cmp.cid=cs.cid  left join ProductMaster pm on pm.pid=cmp.pid left join Product_live pl on pl.pid=pm.pid where cs.active_status=1 and ccm.cluid='"+userdetails[0].cluid+"' and pl.live_status=1  group by cs.cid ",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
      
      //  var collection=  await Collection.getcollectionlist(res,req);


      //  Collection.getcollectionlist(res,req,async function(err,res2) {
      //   if (err) {
      //     result(err, null);
      //   } else {
        
       
      //       console.log("getcollectionlist-----------------",res2);
           
           
      //       let resobj = {
      //         success: true,
      //         status:true,
      //         collection: res2
      //       };
      //       result(null, resobj);              

         
      //   }
      // });


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

  console.log("------------------------req.query",req.query);
  console.log("------------------------------------",req.cid);
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