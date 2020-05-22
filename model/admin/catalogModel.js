"user strict";
var sql     = require("../db.js");
const util  = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant= require('../constant.js');
var request = require('request');
let jwt     = require('jsonwebtoken');
let config  = require('../config.js');
var moment  = require("moment");

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
Catalog.get_l1subcategory_list =async function get_l1subcategory_list(req,result) {
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
Catalog.get_l2subcategory_list =async function get_l2subcategory_list(req,result) {
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
    if(req){
        var wherecon = "";
        if(req.scl1_id){ wherecon = wherecon+" and scl1_id="+req.scl1_id+" "; }
        if(req.scl2_id){ wherecon = wherecon+" and scl2_id="+req.scl2_id+" "; }
        var getproductquery = "select pid,Productname,active_status,scl1_id,scl2_id from ProductMaster where pid !='' "+wherecon;

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
Catalog.update_l1subcategory_livestatus =async function update_l1subcategory_livestatus(req,result) {
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
Catalog.update_l2subcategory_livestatus =async function update_l2subcategory_livestatus(req,result) {
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
        var gatstatusquery = "select active_status from ProductMaster where pid="+req.pid;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].active_status ==0){
                updatestatus = 1;
            }
            var statusupdatequery = "update ProductMaster set active_status="+updatestatus+" where pid="+req.pid;
            var statusupdate = await query(statusupdatequery);
            if(statusupdate.affectedRows > 0){
                var updatedselectquery = "select pid,Productname,active_status from ProductMaster where pid="+req.pid;
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

module.exports = Catalog;