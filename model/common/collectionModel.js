"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var constant = require('../constant.js');
var ZoneModel = require('../common/zoneModel');

var Collection = function(collection) {
  this.cid = collection.cid;
  this.name = collection.name;
  this.active_status = collection.active_status;
  this.query = collection.query;
  this.img_url = collection.img_url;
  this.category_Position = collection.category_Position ||0;
  this.tile_type = collection.tile_type;
  this.clickable = collection.clickable ||true;
  this.product_name = collection.product_name;
  this.classification_type = collection.classification_type;
  this.classification_id = collection.classification_id;
}

Collection.createCollection = async function createCollection(req, result) {   
  req.active_status=0;
  var insertdata = new Collection(req);
  sql.query("INSERT INTO Collections set ?", insertdata,async function(err, res) {
      if (err) {
          let resobj = {
              success: true,
              status: false,
              message: err
          };
          result(null, resobj);
      } else {
          let resobj = {
              success: true,
              status: true,
              result: res
          };
          result(null, resobj);
      }
  });    
};

Collection.updateCollection =async function updateCollection(req, result) {
  var updatedata = new Collection(req);
  console.log("updatedataupdatedata==>",updatedata);
  sql.query("UPDATE Collections SET ? WHERE cid = ?", [updatedata, updatedata.cid],async function(err, res) {
      if (err) {
          let resobj = {
              success: true,
              status: false,
              message: err
          };
          result(null, resobj);
      } else {
          let resobj = {
              success: true,
              status: true,
              result: res
          };
          result(null, resobj);
      }
    }
  );
};

Collection.list_all_active_collection =async function list_all_active_collection(req,result) {

  var userdetails  = await query("select * from User as us left join Cluster_user_table as uc on uc.userid=us.userid where us.userid = "+req.userid+" ");

  if (userdetails.length !==0) {
    var collection_query = "Select cs.cid,cs.name,cs.active_status,cs.img_url as image,cs.category_Position,cs.tile_type,cs.clickable,cs.product_name from Collections as cs left join Cluster_Collection_mapping ccm on ccm.cid=cs.cid where cs.active_status=1 and ccm.cluid='"+userdetails[0].cluid+"' group by cs.cid";
    
    sql.query(collection_query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
      
        // console.log("res",res.length);
        for (let i = 0; i < res.length; i++) {
        
          if (res[i].clickable=1) {
            res[i].clickable=true;
          } else {
            res[i].clickable=false;
          }
          product_query = "select pm.*,br.brandname from  ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join Brand br on br.id=pm.brand  where br.brandname like '%"+res[i].product_name+"%' and pl.live_status=1"
           
          var productlist = await query(product_query);
          // console.log("productlist[0]",productlist[0].brand);
     
   
          if (productlist.length !=0) {
            res[i].collection_status = true;
          
          }else{
            res[i].collection_status = false;
          }
        }
      
         res  =  res.filter(re => re.collection_status ==true);
        // console.log(res);
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

/////Collection classification List/////////// 
Collection.get_classification_list = async function get_classification_list(req,result) {
  var classification = [];
  classification.push({"id":1,"name":"type-1 [brand]"});
  classification.push({"id":2,"name":"type-2 [catagory]"});
  classification.push({"id":3,"name":"type-3 [L1 subcategory]"});
  classification.push({"id":4,"name":"type-4 [L2 subcategory]"});
  let resobj = {
    success: true,
    status: true,
    result: classification
  };
  result(null, resobj);  
};

/////Collection classification Filter/////////// 
Collection.classificationfilter = async function classificationfilter(req,result) {
  var resultdata = "";
  switch (req.type) {
    case "1":
      var getbrandquery = "select id,brandname as name from Brand"
      var getbrand = await query(getbrandquery);
      resultdata = getbrand;
      break;
    case "2":
      var getbrandquery = "select catid as id,name from Category"
      var getbrand = await query(getbrandquery);
      resultdata = getbrand;
      break;
    case "3":
      var getbrandquery = "select scl1_id as id,name from SubcategoryL1"
      var getbrand = await query(getbrandquery);
      resultdata = getbrand;
      break;
    case "4":
      var getbrandquery = "select scl2_id as id,name from SubcategoryL2"
      var getbrand = await query(getbrandquery);
      resultdata = getbrand;
      break;
  
    default:
      break;
  }

  let resobj = {
    success: true,
    status: true,
    result: resultdata
  };
  result(null, resobj);  
};

/////Collection Add/////////// 
Collection.collection_add = async function collection_add(req,result) {
  if(req.name!='' && req.tile_type!='' && req.classification_type!='' && req.img_url!='' && req.classification_id!='' ){
    var resultdata = "";
    var collectionquery = "";
    var insertdata = [];
    insertdata.push({"name":req.name,"tile_type":req.tile_type,"classification_type":req.classification_type,"img_url":req.img_url,"classification_id":req.classification_id,"query":""}) ;
    
    switch (req.classification_type) {
      case "1":
        collectionquery = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = ? left join Brand br on br.id=pm.brand where pl.zoneid = ? and pl.live_status = ? and pm.brand="+req.classification_id+" ";
        insertdata[0].query = collectionquery;
        break;
      case "2":
        collectionquery = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = ? left join Brand br on br.id=pm.brand left join SubcategoryL1 as l1scat on l1scat.catid= pm.scl1_id left join Category as cat on cat.catid=l1scat.scl1_id where pl.zoneid = ? and pl.live_status = ? and cat.catid="+req.classification_id+" ";
        insertdata[0].query = collectionquery;
        break;
      case "3":
        collectionquery = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = ? left join Brand br on br.id=pm.brand left join SubcategoryL1 as l1scat on l1scat.catid= pm.scl1_id where pl.zoneid = ? and pl.live_status = ? and pm.scl1_id ="+req.classification_id+" ";
        insertdata[0].query = collectionquery;
        break;
      case "4":
        collectionquery = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = ? left join Brand br on br.id=pm.brand left join SubcategoryL1 as l1scat on l1scat.catid= pm.scl1_id where pl.zoneid = ? and pl.live_status = ? and pm.scl2_id ="+req.classification_id+" ";
        insertdata[0].query = collectionquery;
        break;
    
      default:
        break;
    }

    await Collection.createCollection(insertdata[0], async function(err,collectionres){
      if(collectionres.success==true){
        let resobj = {
          success: true,
          status: true,
          result: collectionres,
          message: "collection Added Successfully"
        };
        result(null, resobj); 
      }else{
        let resobj = {
          success: true,
          status: false,
          message: "something went wrong plz try again"
        };
        result(null, resobj); 
      } 
    });
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);  
  }  
};

/////Collection Edit/////////// 
Collection.collection_edit = async function collection_edit(req,result) {
  if(req.cid!='' && req.name!='' && req.tile_type!='' && req.classification_type!='' && req.img_url!='' && req.classification_id!='' ){
    var resultdata = "";
    var collectionquery = "";
    var updateddata = [];
    updateddata.push({"cid":parseInt(req.cid),"name":req.name,"tile_type":req.tile_type,"classification_type":req.classification_type,"img_url":req.img_url,"classification_id":req.classification_id,"query":""}) ;
    
    switch (req.classification_type) {
      case "1":
        collectionquery = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = ? left join Brand br on br.id=pm.brand where pl.zoneid = ? and pl.live_status = ? and pm.brand="+req.classification_id+" ";
        updateddata[0].query = collectionquery;
        break;
      case "2":
        collectionquery = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = ? left join Brand br on br.id=pm.brand left join SubcategoryL1 as l1scat on l1scat.catid= pm.scl1_id left join Category as cat on cat.catid=l1scat.scl1_id where pl.zoneid = ? and pl.live_status = ? and cat.catid="+req.classification_id+" ";
        updateddata[0].query = collectionquery;
        break;
      case "3":
        collectionquery = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = ? left join Brand br on br.id=pm.brand left join SubcategoryL1 as l1scat on l1scat.catid= pm.scl1_id where pl.zoneid = ? and pl.live_status = ? and pm.scl1_id ="+req.classification_id+" ";
        updateddata[0].query = collectionquery;
        break;
      case "4":
        collectionquery = "select pm.*,pl.*,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from ProductMaster pm left join Product_live pl on pl.pid=pm.pid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = ? left join Brand br on br.id=pm.brand left join SubcategoryL1 as l1scat on l1scat.catid= pm.scl1_id where pl.zoneid = ? and pl.live_status = ? and pm.scl2_id ="+req.classification_id+" ";
        updateddata[0].query = collectionquery;
        break;
    
      default:
        break;
    }

    await Collection.updateCollection(updateddata[0], async function(err,collectionres){
      if(collectionres.success==true){
        let resobj = {
          success: true,
          status: true,
          result: collectionres,
          message: "collection updated Successfully"
        };
        result(null, resobj); 
      }else{
        let resobj = {
          success: true,
          status: false,
          message: "something went wrong plz try again"
        };
        result(null, resobj); 
      } 
    });
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);  
  }  
};

/////Collection View/////////// 
Collection.collection_view = async function collection_view(req,result) {
  if(req.cid!=''){
    var getcollectionquery = "select * from Collections where cid="+req.cid;
    var getcollection = await query(getcollectionquery);
    if(getcollection.length>0){
        let resobj = {
          success: true,
          status: true,
          result: getcollection
        };
        result(null, resobj); 
      }else{
        let resobj = {
          success: true,
          status: false,
          message: "no data"
        };
        result(null, resobj); 
      } 
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);  
  }  
};

/////Collection List/////////// 
Collection.collection_list = async function collection_list(req,result) {
  if(req.cid!=''){
    var getcollectionquery = "select * from Collections";
    var getcollection = await query(getcollectionquery);
    if(getcollection.length>0){
        let resobj = {
          success: true,
          status: true,
          result: getcollection
        };
        result(null, resobj); 
      }else{
        let resobj = {
          success: true,
          status: false,
          message: "no data"
        };
        result(null, resobj); 
      } 
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);  
  }  
};

module.exports = Collection;