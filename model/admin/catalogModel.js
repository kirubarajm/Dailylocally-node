"user strict";
var sql     = require("../db.js");
const util  = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant= require('../constant.js');
var request = require('request');
let jwt     = require('jsonwebtoken');
let config  = require('../config.js');
var moment  = require("moment");
var Category = require('../admin/categoryTableModel.js');
var Subcategoryl1 = require('../admin/subcategoryl1TableModel.js');
var Subcategoryl2 = require('../admin/subcategoryl2TableModel.js');
var Product = require('../admin/productTableModel.js');
var VendorProductMapping = require('../admin/vendorproductmappingTableModel');

var Catalog = function(catalog) {};

/////////Get Category List///////////
Catalog.get_category_list =async function get_category_list(req,result) {
  var getcategoryquery = "select catid,name,active_status from Category";
  var getcategory = await query(getcategoryquery);
  if(getcategory.length > 0){
    let resobj = {
        success: true,
        status: true,
        data: getcategory
    };
    result(null, resobj);
  }else{
    let resobj = {
        success: true,
        status: false,
        message: "no records found"
    };
    result(null, resobj);
  }
};

/////////Get L1SubCategory List///////////
Catalog.get_subcategoryl1_list =async function get_subcategoryl1_list(req,result) {
    if(req.catid){
        var getl1subcategoryquery = "select l1.scl1_id,l1.name,l1.active_status,l1.catid,if(scl2_id,1,0) as l2_status from SubcategoryL1 as l1 left join SubcategoryL2 as l2 on l1.scl1_id=l2.scl1_id where l1.catid="+req.catid+" group by l1.scl1_id;"
        var getl1subcategory = await query(getl1subcategoryquery);
        if(getl1subcategory.length > 0){
            let resobj = {
                success: true,
                status: true,
                data: getl1subcategory
            };
        result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no records found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }    
};

/////////Get L2SubCategory List///////////
Catalog.get_subcategoryl2_list =async function get_subcategoryl2_list(req,result) {
    if(req.scl1_id){
        var getcategoryquery = "select scl2_id,name,active_status,scl1_id from SubcategoryL2 where scl1_id="+req.scl1_id;
        var getcategory = await query(getcategoryquery);
        if(getcategory.length > 0){
            let resobj = {
                success: true,
                status: true,
                data: getcategory
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no records found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    } 
};

/////////Get Product List///////////
Catalog.get_product_list =async function get_product_list(req,result) {
    if(req.zone_id){
        var wherecon = "";
        if(req.scl1_id){ wherecon = wherecon+" and pm.scl1_id="+req.scl1_id+" "; }
        if(req.scl2_id){ wherecon = wherecon+" and pm.scl2_id="+req.scl2_id+" "; }
        var getproductquery = "select pm.pid,pm.Productname,pm.active_status,pm.scl1_id,pm.scl2_id from ProductMaster as pm left join Product_live as pl on pl.pid=pm.pid where pm.pid !='' "+wherecon+" and pl.zoneid="+req.zone_id;
        
        var getproduct = await query(getproductquery);
        if(getproduct.length > 0){
            let resobj = {
                success: true,
                status: true,
                data: getproduct
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no records found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Update Category Status///////////
Catalog.update_category_livestatus =async function update_category_livestatus(req,result) {
    if(req.catid){
        var gatstatusquery = "select active_status from Category where catid="+req.catid;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].active_status ==0){
                updatestatus = 1;
            }
            var statusupdatequery = "update Category set active_status="+updatestatus+" where catid="+req.catid;
            var statusupdate = await query(statusupdatequery);
            if(statusupdate.affectedRows > 0){
                var updatedselectquery = "select catid,name,active_status from Category where catid="+req.catid;
                var updatedselect = await query(updatedselectquery);
                let resobj = {
                    success: true,
                    status: true,
                    message: "category updated successfully",
                    data: updatedselect
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "something went please try again"
                };
                result(null, resobj);
            }
        }      
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Update L1SubCategory Status///////////
Catalog.update_subcategoryl1_livestatus =async function update_subcategoryl1_livestatus(req,result) {
    if(req.scl1_id){
        var gatstatusquery = "select active_status from SubcategoryL1 where scl1_id="+req.scl1_id;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].active_status ==0){
                updatestatus = 1;
            }
            var statusupdatequery = "update SubcategoryL1 set active_status="+updatestatus+" where scl1_id="+req.scl1_id;
            var statusupdate = await query(statusupdatequery);
            if(statusupdate.affectedRows > 0){
                var updatedselectquery = "select scl1_id,name,active_status from SubcategoryL1 where scl1_id="+req.scl1_id;
                var updatedselect = await query(updatedselectquery);
                let resobj = {
                    success: true,
                    status: true,
                    message: "SubcategoryL1 updated successfully",
                    data: updatedselect
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "something went please try again"
                };
                result(null, resobj);
            }
        }      
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Update L2SubCategory Status///////////
Catalog.update_subcategoryl2_livestatus =async function update_subcategoryl2_livestatus(req,result) {
    if(req.scl2_id){
        var gatstatusquery = "select active_status from SubcategoryL2 where scl2_id="+req.scl2_id;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].active_status ==0){
                updatestatus = 1;
            }
            var statusupdatequery = "update SubcategoryL2 set active_status="+updatestatus+" where scl2_id="+req.scl2_id;
            var statusupdate = await query(statusupdatequery);
            if(statusupdate.affectedRows > 0){
                var updatedselectquery = "select scl2_id,name,active_status from SubcategoryL2 where scl2_id="+req.scl2_id;
                var updatedselect = await query(updatedselectquery);
                let resobj = {
                    success: true,
                    status: true,
                    message: "SubcategoryL2 updated successfully",
                    data: updatedselect
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "something went please try again"
                };
                result(null, resobj);
            }
        }      
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Update Product Status///////////
Catalog.update_product_livestatus =async function update_product_livestatus(req,result) {
    if(req.pid){
        var gatstatusquery = "select active_status from Product_live where pid="+req.pid;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].active_status ==0){
                updatestatus = 1;
            }
            var statusupdatequery = "update Product_live set live_status="+updatestatus+" where pid="+req.pid;
            var statusupdate = await query(statusupdatequery);
            if(statusupdate.affectedRows > 0){
                var updatedselectquery = "select pm.pid,pm.Productname,pl.live_status from ProductMaster as pm left join Product_live as pl on pl.pid=pm.pid where pm.pid="+req.pid;
                var updatedselect = await query(updatedselectquery);
                let resobj = {
                    success: true,
                    status: true,
                    message: "ProductMaster updated successfully",
                    data: updatedselect
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "something went please try again"
                };
                result(null, resobj);
            }
        }      
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Search Catalog///////////
Catalog.search_catalog =async function search_catalog(req,result) {
    if(req.search){
        var getsearchquery = "(SELECT name,'categoty' as type FROM Category WHERE name LIKE '%"+req.search+"%') UNION (SELECT name,'l1subcategoty' as type FROM SubcategoryL1 WHERE name LIKE '%"+req.search+"%') UNION (SELECT name,'l2subcategoty' as type FROM SubcategoryL2 WHERE name LIKE '%"+req.search+"%') UNION (SELECT Productname as name,'product' as type FROM ProductMaster WHERE Productname LIKE '%"+req.search+"%')";
        var getsearch = await query(getsearchquery);
        if(getsearch.length > 0){
            let resobj = {
                success: true,
                status: true,
                data: getsearch
            };
        result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no records found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Search Catalog Data///////////
Catalog.search_catalog_data =async function search_catalog_data(req,result) {
    if(req.id && req.type){

        var catid = 0;
        var scl1_id = 0;
        var scl2_id = 0;
        var pid = 0;

        var category =[];
        var l1subcategory =[];
        var l2subcategory =[];
        var product =[];

        switch (req.type) {
            case 'catid':            
                catid=req.id;
                break;
            case 'scl1_id':
                var getidsquery = "select catid,scl1_id from SubcategoryL1 where scl1_id="+req.id;
                var getids = await query(getidsquery);
                if(getids.length>0){
                    catid = getids[0].catid;
                    scl1_id = getids[0].scl1_id;
                }
                break;
            case 'scl2_id':
                var getidsquery = "select l1.catid,l2.scl1_id,l2.scl2_id from SubcategoryL2 as l2 left join SubcategoryL1 as l1 on l1.scl1_id=l2.scl1_id where l2.scl2_id="+req.id+" group by l2.scl2_id";
                var getids = await query(getidsquery);
                if(getids.length>0){
                    catid = getids[0].catid;
                    scl1_id = getids[0].scl1_id;
                    scl2_id = getids[0].scl2_id;
                }
                break;
            case 'pid': 
                var getidsquery = "select l1.catid,pm.scl1_id,pm.scl2_id,pm.pid from ProductMaster as pm left join SubcategoryL1 as l1 on l1.scl1_id=pm.scl1_id where pm.pid="+req.id+" group by pm.pid";
                var getids = await query(getidsquery);
                if(getids.length>0){
                    catid = getids[0].catid;
                    scl1_id = getids[0].scl1_id;
                    scl2_id = getids[0].scl2_id;
                    pid = getids[0].pid;
                }
                break;        
            default:
                break;
        }

        if(catid>0){
            var categorydataquery = "select catid,name,active_status from Category where catid="+catid;
            category = await query(categorydataquery);            
        }

        if(scl1_id>0){
            var l1subcategorydataquery = "select l1.scl1_id,l1.name,l1.active_status,l1.catid,if(scl2_id,1,0) as l2_status from SubcategoryL1 as l1 left join SubcategoryL2 as l2 on l1.scl1_id=l2.scl1_id where l1.scl1_id="+scl1_id+" group by l1.scl1_id";
            l1subcategory = await query(l1subcategorydataquery);            
        }

        if(scl2_id>0){
            var l2subcategorydataquery = "select scl2_id,name,active_status,scl1_id from SubcategoryL2 where scl2_id="+scl2_id;
            l2subcategory = await query(l2subcategorydataquery);            
        }

        if(pid>0){
            var productdataquery = "select pid,Productname,active_status,scl1_id,scl2_id from ProductMaster where pid="+pid;
            product = await query(productdataquery);            
        }
        
        let resobj = {
            success: true,
            status: true,
            category: category,
            l1subcategory:l1subcategory,
            l2subcategory:l2subcategory,
            product:product
        };
        result(null, resobj);        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////view Category///////////
Catalog.view_category =async function view_category(req,result) {
    if(req.catid){
        var getcategoryquery = "select * from Category where catid="+req.catid;
        var getcategory = await query(getcategoryquery);
        if(getcategory.length > 0 ){
            let resobj = {
                success: true,
                status: true,
                date: getcategory
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
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Add Category///////////
Catalog.add_category =async function add_category(req,result) {
    if(req.name && req.image){
        var checkcategoryquery = "select * from Category where name='"+req.name+"' ";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            var addcategory = await Category.createCategory(req);           
            let resobj = {
                success: true,
                status: true,
                message: "category added susccessfully"
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "category name already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Edit Category///////////
Catalog.edit_category =async function edit_category(req,result) {
    if(req.catid && req.name){
        var checkcategoryquery = "select * from Category where name='"+req.name+"' and catid NOT IN("+req.catid+")";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            var updatecategory = await Category.updateCategory(req);           
            let resobj = {
                success: true,
                status: true,
                message: "category Updated susccessfully"
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "category name already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////view SubCategoryL1///////////
Catalog.view_subcategoryl1 =async function view_subcategoryl1(req,result) {
    if(req.scl1_id){
        var getsubcategoryl1query = "select * from SubcategoryL1 where scl1_id="+req.scl1_id;
        var getsubcategoryl1 = await query(getsubcategoryl1query);
        if(getsubcategoryl1.length > 0 ){
            let resobj = {
                success: true,
                status: true,
                date: getsubcategoryl1
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
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Add SubCategoryL1///////////
Catalog.add_subcategoryl1 =async function add_subcategoryl1(req,result) {
    if(req.name && req.image && req.catid){
        var checksubcategoryl1query = "select * from SubcategoryL1 where name='"+req.name+"' ";
        var checksubcategoryl1 = await query(checksubcategoryl1query);
        if(checksubcategoryl1.length ==0 ){
            var checkcategoryquery = "select * from Category where catid="+req.catid;
            var checkcategory = await query(checkcategoryquery);
            if(checkcategory.length >0){
                var addsubcategoryl1 = await Subcategoryl1.createSubcategoryl1(req);           
                let resobj = {
                    success: true,
                    status: true,
                    message: "subcategoryl1 added susccessfully"
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "invalid category"
                };
                result(null, resobj);
            }            
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "subcategoryl1 name already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Edit SubCategoryL1///////////
Catalog.edit_subcategoryl1 =async function edit_subcategoryl1(req,result) {
    if(req.scl1_id && req.name){
        var checkcategoryquery = "select * from SubcategoryL1 where name='"+req.name+"' and scl1_id NOT IN("+req.scl1_id+")";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            var updatesubcategoryl1 = await Subcategoryl1.updateSubcategoryl1(req);           
            let resobj = {
                success: true,
                status: true,
                message: "subcategoryl1 Updated susccessfully"
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "subcategoryl1 name already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////view SubCategoryL2///////////
Catalog.view_subcategoryl2 =async function view_subcategoryl2(req,result) {
    if(req.scl2_id){
        var getsubcategoryl2query = "select * from SubcategoryL2 where scl2_id="+req.scl2_id;
        var getsubcategoryl2 = await query(getsubcategoryl2query);
        if(getsubcategoryl2.length > 0 ){
            let resobj = {
                success: true,
                status: true,
                date: getsubcategoryl2
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
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Add SubCategoryL2///////////
Catalog.add_subcategoryl2 =async function add_subcategoryl2(req,result) {
    if(req.name && req.image && req.scl1_id){
        var checksubcategoryl2query = "select * from SubcategoryL2 where name='"+req.name+"' ";
        var checksubcategoryl2 = await query(checksubcategoryl2query);
        if(checksubcategoryl2.length ==0 ){
            var checksubcategoryl1query = "select * from SubcategoryL1 where scl1_id="+req.scl1_id;
            var checksubcategoryl1 = await query(checksubcategoryl1query);
            if(checksubcategoryl1.length >0){
                var addsubcategoryl2 = await Subcategoryl2.createSubcategoryl2(req);           
                let resobj = {
                    success: true,
                    status: true,
                    message: "subcategoryl2 added susccessfully"
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "invalid subcategoryl1"
                };
                result(null, resobj);
            }            
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "subcategoryl2 name already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Edit SubCategoryL2///////////
Catalog.edit_subcategoryl2 =async function edit_subcategoryl2(req,result) {
    if(req.scl2_id && req.name){
        var checksubcategoryl2query = "select * from SubcategoryL2 where name='"+req.name+"' and scl2_id NOT IN("+req.scl2_id+")";
        var checksubcategoryl2 = await query(checksubcategoryl2query);
        if(checksubcategoryl2.length ==0 ){
            var updatesubcategoryl2 = await Subcategoryl2.updateSubcategoryl2(req);           
            let resobj = {
                success: true,
                status: true,
                message: "subcategoryl1 Updated susccessfully"
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "subcategoryl2 name already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Get UOM List///////////
Catalog.get_uom_list =async function get_uom_list(req,result) {
    var getuomquery = "select uomid,name from UOM";
    var getuom = await query(getuomquery);
    if(getuom.length > 0){
      let resobj = {
          success: true,
          status: true,
          data: getuom
      };
      result(null, resobj);
    }else{
      let resobj = {
          success: true,
          status: false,
          message: "no records found"
      };
      result(null, resobj);
    }
};

/////////Get Brand List///////////
Catalog.get_brand_list =async function get_brand_list(req,result) {
    var getbrandquery = "select id,brandname from Brand";
    var getbrand = await query(getbrandquery);
    if(getbrand.length > 0){
      let resobj = {
          success: true,
          status: true,
          data: getbrand
      };
      result(null, resobj);
    }else{
      let resobj = {
          success: true,
          status: false,
          message: "no records found"
      };
      result(null, resobj);
    }
};

/////////view Product///////////
Catalog.view_product =async function view_product(req,result) {
    if(req.product_id){
        var getproductquery = "select cat.name as category_name,sc1.name as subcategoryl1_name,sc2.name as subcategory2_name,pm.Productname,pm.pid as product_id,pm.weight,uom.name as uom,pm.packetsize,br.brandname,pm.short_desc,pm.productdetails,'zone mapping' as zonemapping,pm.hsn_code,pm.tag,if(pm.Perishable=1,'yes','no') as Perishable,case when pm.vegtype=0 then 'veg' when pm.vegtype=1 then 'nonveg' when pm.vegtype=2 then 'Vegan' end as vegtype,pm.basiccost as targetedbaseprice,pm.image,pm.mrp,pm.gst,pm.discount_cost,(pm.mrp-pm.discount_cost) as discountedamount from ProductMaster as pm left join SubcategoryL1 as sc1 on sc1.scl1_id=pm.scl1_id left join SubcategoryL2 as sc2 on sc2.scl2_id=pm.scl2_id left join Category as cat on cat.catid=sc1.catid left join Brand as br on br.id=pm.brand left join UOM as uom on uom.uomid=pm.uom where pm.pid="+req.product_id;
        var getproduct = await query(getproductquery);
        if(getproduct.length > 0 ){
            var getvendorquery = "select vpmid,vpm.vid as vendorid,v.name as vendorname,vpm.expiry_date,vpm.base_price,vpm.other_charges,(vpm.base_price+((vpm.base_price*vpm.other_charges)/100)) as cost_price from Vendor as v left join Vendor_products_mapping as vpm on vpm.vid=v.vid where vpm.pid="+req.product_id;
            var getvendor = await query(getvendorquery);
            getproduct[0].vendorlist = getvendor;

            let resobj = {
                success: true,
                status: true,
                date: getproduct
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
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Add Product///////////
Catalog.add_product =async function add_product(req,result) {
    if(req){
        var checkcategoryquery = "select * from ProductMaster where Productname='"+req.productname+"' ";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            var addproduct = await Product.createProduct(req);           
            let resobj = {
                success: true,
                status: true,
                message: "Product added susccessfully"
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "Product name already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Edit Product///////////
Catalog.edit_product =async function edit_product(req,result) {
    if(req){
        var checkcategoryquery = "select * from ProductMaster where Productname='"+req.productname+"' and pid NOT IN("+req.pid+")";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            var updateproduct = await Product.updateProduct(req);            
            let resobj = {
                success: true,
                status: true,
                message: "Product Updated susccessfully"
            };
            result(null, resobj);             
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "Product name already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////// Edit Vendor Product Mapping ////////////////
Catalog.edit_vendor_product_mapping =async function edit_vendor_product_mapping(req,result) {
    if(req.vpmid){        
        var updateVPM = await VendorProductMapping.updateVendorProductMapping(req);            
        let resobj = {
            success: true,
            status: true,
            message: "vendor product mapping Updated susccessfully"
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Search Catalog///////////
Catalog.home_quick_search =async function home_quick_search(req,result) {

    var userdetails       = await query("select * from User where userid = "+req.userid+" ");
    
    var servicable_status= true;
    if (userdetails.length !=0) {
        
        var get_nearby_zone = await query("select *, ROUND( 3959 * acos( cos( radians('" +
        req.lat +
        "') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('" +
        req.lon +
        "') ) + sin( radians('" +
        req.lat +
        "') ) * sin(radians(lat)) ) , 2) AS distance from Zone  order by distance asc limit 1");
    
    
      if (get_nearby_zone.length !=0) {
        
  
        if (get_nearby_zone[0].distance > constant.radiuslimit) {
          servicable_status =false;
        }
      }
  
  
      if(req.search){
          var getsearchquery = "(SELECT name,'1' as type FROM Category WHERE name LIKE '%"+req.search+"%') UNION (SELECT name,'2' as type FROM SubcategoryL1 WHERE name LIKE '%"+req.search+"%') UNION (SELECT name,'3' as type FROM SubcategoryL2 WHERE name LIKE '%"+req.search+"%') UNION (SELECT Productname as name,'4' as type FROM ProductMaster WHERE Productname LIKE '%"+req.search+"%')";
          var getsearch = await query(getsearchquery);
          if(getsearch.length > 0){

          

              let resobj = {
                  success: true,
                  status: true,
                  servicable_status:servicable_status,
                  data: getsearch
              };
          result(null, resobj);
          }else{
              let resobj = {
                  success: true,
                  status: false,
                  message: "no records found"
              };
              result(null, resobj);
          }
      }else{
          let resobj = {
              success: true,
              status: false,
              message: "check your post value"
          };
          result(null, resobj);
      }

    } else {
        let resobj = {
            success: true,
            status: false,
            message: "user not found"
        };
        result(null, resobj);
    }

     
};

/////////Search Catalog Data///////////
Catalog.search_catalog_data_mobile =async function search_catalog_data_mobile(req,result) {
    if(req.type){

        var catid = 0;
        var scl1_id = 0;
        var scl2_id = 0;
        var pid = 0;

        var category =[];
        var l1subcategory =[];
        var l2subcategory =[];
        var product =[];

        switch (req.type) {
            case 1:            
                catid=req.id;
                break;
            case 2:
                var getidsquery = "select catid,scl1_id from SubcategoryL1 where scl1_id="+req.id;
                var getids = await query(getidsquery);
                if(getids.length>0){
                    catid = getids[0].catid;
                    scl1_id = getids[0].scl1_id;
                }
                break;
            case 3:
                var getidsquery = "select l1.catid,l2.scl1_id,l2.scl2_id from SubcategoryL2 as l2 left join SubcategoryL1 as l1 on l1.scl1_id=l2.scl1_id where l2.scl2_id="+req.id+" group by l2.scl2_id";
                var getids = await query(getidsquery);
                if(getids.length>0){
                    catid = getids[0].catid;
                    scl1_id = getids[0].scl1_id;
                    scl2_id = getids[0].scl2_id;
                }
                break;
            case 4: 
                var getidsquery = "select l1.catid,pm.scl1_id,pm.scl2_id,pm.pid from ProductMaster as pm left join SubcategoryL1 as l1 on l1.scl1_id=pm.scl1_id where pm.pid="+req.id+" group by pm.pid";
                var getids = await query(getidsquery);
                if(getids.length>0){
                    catid = getids[0].catid;
                    scl1_id = getids[0].scl1_id;
                    scl2_id = getids[0].scl2_id;
                    pid = getids[0].pid;
                }
                break;        
            default:
                break;
        }

        if(catid>0){
            var categorydataquery = "select catid,name,active_status from Category where catid="+catid;
            category = await query(categorydataquery);            
        }

        if(scl1_id>0){
            var l1subcategorydataquery = "select l1.scl1_id,l1.name,l1.active_status,l1.catid,if(scl2_id,1,0) as l2_status from SubcategoryL1 as l1 left join SubcategoryL2 as l2 on l1.scl1_id=l2.scl1_id where l1.scl1_id="+scl1_id+" group by l1.scl1_id";
            l1subcategory = await query(l1subcategorydataquery);            
        }

        if(scl2_id>0){
            var l2subcategorydataquery = "select scl2_id,name,active_status,scl1_id from SubcategoryL2 where scl2_id="+scl2_id;
            l2subcategory = await query(l2subcategorydataquery);            
        }

        if(pid>0){
            var productdataquery = "select pid,Productname,active_status,scl1_id,scl2_id from ProductMaster where pid="+pid;
            product = await query(productdataquery);            
        }
        
        let resobj = {
            success: true,
            status: true,
            category: category,
            l1subcategory:l1subcategory,
            l2subcategory:l2subcategory,
            product:product
        };
        result(null, resobj);        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};



module.exports = Catalog;