"user strict";
var sql     = require("../db.js");
const util  = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant= require('../constant.js');
var request = require('request');
let jwt     = require('jsonwebtoken');
let config  = require('../config.js');
var moment  = require("moment");
var Category = require('../tableModels/categoryTableModel.js');
var Subcategoryl1 = require('../tableModels/subcategoryl1TableModel.js');
var Subcategoryl2 = require('../tableModels/subcategoryl2TableModel.js');
var Product = require('../tableModels/productTableModel.js');
var VendorProductMapping = require('../tableModels/vendorproductmappingTableModel.js');
var ProductLive = require('../tableModels/productliveTableModel.js');
var L2SubCategoryMapping = require('../tableModels/zonel2subcategorymappingTableModel.js');
var L1SubCategoryMapping = require('../tableModels/zonel1subcategorymappingTableModel.js');
var CategoryMapping = require('../tableModels/zonecategorymappingTableModel.js');
var sub_category_L1 = require("../../model/category/subcategoryL1Model");
var Sub_Category_L2 = require("../../model/category/subcategoryL2Model");
var Productlist = require("../../model/category/productmasterModel");
var ClusterCategoryMapping = require("../tableModels/clustercategorymappingTableModel.js");
var CatalogLog = require('../tableModels/cataloglogTableModel.js');
//var layoutconstant= require('../constant1.json');
// const file = require(layoutconstant);



var Catalog = function(catalog) {};


var AWS_ACCESS_KEY = "AKIAJJQUEYLIU23E63OA";
var AWS_SECRET_ACCESS_KEY = "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";
const fs = require("fs");
const AWS = require("aws-sdk");
const { json } = require("body-parser");
const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: "us-east-1"
});

/////////Get Category List///////////
Catalog.get_category_list =async function get_category_list(req,result) {
    if(req.zoneid){
        var getcategoryquery = "select ca.catid,ca.name,zcm.active_status,ca.image,ca.thumbimage from Category as ca left join Zone_category_mapping as zcm on zcm.master_catid=ca.catid where zcm.zoneid="+req.zoneid;
        var getcategory = await query(getcategoryquery);
        if(getcategory.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getcategory
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
            message: "check your post values"
        };
        result(null, resobj);
    }  
};

/////////Get L1SubCategory List///////////
Catalog.get_subcategoryl1_list =async function get_subcategoryl1_list(req,result) {
    if(req.catid && req.zoneid){
        var getl1subcategoryquery = "select l1.scl1_id,l1.name,zl1sm.active_status,l1.image,l1.catid,if(scl2_id,1,0) as l2_status from SubcategoryL1 as l1 left join SubcategoryL2 as l2 on l1.scl1_id=l2.scl1_id left join Zone_l1_subcategory_mapping as zl1sm on zl1sm.master_l1_subcatid=l1.scl1_id where l1.catid="+req.catid+" and zl1sm.zoneid="+req.zoneid+" group by l1.scl1_id";        
        var getl1subcategory = await query(getl1subcategoryquery);
        if(getl1subcategory.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getl1subcategory
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
    if(req.scl1_id && req.zoneid){
        var getl2subcategoryquery = "select l2.scl2_id,l2.name,zl2sm.active_status,l2.image,l2.scl1_id from SubcategoryL2 as l2 left join Zone_l2_subcategory_mapping as zl2sm on zl2sm.master_l2_subcatid=l2.scl2_id where scl1_id="+req.scl1_id+" and zl2sm.zoneid="+req.zoneid+" group by l2.scl2_id";        
        var getl2subcategory = await query(getl2subcategoryquery);
        if(getl2subcategory.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getl2subcategory
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
    if(req.zoneid){
        var wherecon = "";
        if(req.scl1_id){ wherecon = wherecon+" and pm.scl1_id="+req.scl1_id+" "; }
        if(req.scl2_id==0){ wherecon = wherecon+" and pm.scl2_id="+req.scl2_id+" "; }else if(req.scl2_id){ wherecon = wherecon+" and pm.scl2_id="+req.scl2_id+" "; }
        var getproductquery = "select pm.pid,pm.Productname,pl.live_status,pm.image,pm.scl1_id,pm.scl2_id from ProductMaster as pm left join Product_live as pl on pl.pid=pm.pid where pm.delete_status=0 and pl.zoneid="+req.zoneid+" "+wherecon+" group by pm.pid ";
        var getproduct = await query(getproductquery);
        if(getproduct.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getproduct
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
    if(req.catid && req.zoneid){
        var gatstatusquery = "select active_status from Zone_category_mapping where master_catid="+req.catid+" and zoneid="+req.zoneid;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].active_status ==0){
                updatestatus = 1;
            }

            if(updatestatus==0){
                var getl1subquery = "select scl1_id from SubcategoryL1 where catid="+req.catid;
                var getl1sub = await query(getl1subquery);
                if(getl1sub.length > 0){
                    var l1sub = [];
                    for (let i = 0; i < getl1sub.length; i++) {
                        l1sub.push(getl1sub[i].scl1_id);
                        var getl2subquery = "select scl2_id from SubcategoryL2 where scl1_id="+getl1sub[i].scl1_id;
                        var getl2sub = await query(getl2subquery);
                        if(getl2sub.length>0){
                            var l2sub = [];
                            for (let i = 0; i < getl2sub.length; i++) {
                                l2sub.push(getl2sub[i].scl2_id);                            
                            }
                            var updatel2subtatusquery = "update Zone_l2_subcategory_mapping set active_status=0 where master_l2_subcatid IN("+l2sub+") and zoneid="+req.zoneid;
                            var updatel2subtatus = await query(updatel2subtatusquery);
                        }                        

                        var getproductsquery = "select pid from ProductMaster where scl1_id="+getl1sub[i].scl1_id;
                        var getproducts = await query(getproductsquery);
                        if(getproducts.length>0){
                            var products = [];
                            for (let j = 0; j < getproducts.length; j++) {
                                products.push(getproducts[j].pid);                            
                            }
                            var updateproductstatusquery = "update Product_live set live_status=0 where pid IN("+products+") and zoneid="+req.zoneid;
                            var updateproductstatus = await query(updateproductstatusquery);
                        }
                        
                    }
                    var updatel1subtatusquery = "update Zone_l1_subcategory_mapping set active_status=0 where master_l1_subcatid IN("+l1sub+") and zoneid="+req.zoneid;
                    var updatel1subtatus = await query(updatel1subtatusquery);
                }                
            }
                
            var statusupdatequery = "update Zone_category_mapping set active_status="+updatestatus+" where master_catid="+req.catid+" and zoneid="+req.zoneid;
            var statusupdate = await query(statusupdatequery);
            if(statusupdate.affectedRows > 0){                
                var updatedselectquery = "select ca.catid,ca.name,zcm.active_status from Category as ca left join Zone_category_mapping as zcm on zcm.master_catid=ca.catid where ca.catid="+req.catid+" and zcm.zoneid="+req.zoneid;
                var updatedselect = await query(updatedselectquery);
                let resobj = {
                    success: true,
                    status: true,
                    message: "category updated successfully",
                    result: updatedselect
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
    if(req.scl1_id && req.zoneid){
        var gatstatusquery = "select active_status from Zone_l1_subcategory_mapping where master_l1_subcatid="+req.scl1_id+" and zoneid="+req.zoneid;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].active_status ==0){
                updatestatus = 1;
            }

            if(updatestatus == 1){
                var checkprevousstatesquery = "select sl1.scl1_id,sl1.catid,zcm.active_status as cat_status from SubcategoryL1 as sl1 left join Zone_category_mapping as zcm on zcm.master_catid=sl1.catid where sl1.scl1_id="+req.scl1_id+" and zcm.zoneid="+req.zoneid;                
                var checkprevousstates = await query(checkprevousstatesquery);
                //console.log("checkprevousstates --->",checkprevousstates);
                if(checkprevousstates[0].cat_status==0){
                    //console.log("l2 sub out");
                    let resobj = {
                        success: true,
                        status: false,
                        message: "product can be lived only if category should be mode live",
                    };
                    result(null, resobj);
                }else{
                    var statusupdatequery = "update Zone_l1_subcategory_mapping set active_status="+updatestatus+" where master_l1_subcatid="+req.scl1_id+" and zoneid="+req.zoneid;
                    var statusupdate = await query(statusupdatequery);
                    if(statusupdate.affectedRows > 0){
                        var updatedselectquery = "select sl1.scl1_id,sl1.name,zl1sc.active_status from SubcategoryL1 as sl1 left join Zone_l1_subcategory_mapping as zl1sc on zl1sc.master_l1_subcatid=sl1.scl1_id where scl1_id="+req.scl1_id+" group by sl1.scl1_id";
                        var updatedselect = await query(updatedselectquery);
                        let resobj = {
                            success: true,
                            status: true,
                            message: "SubcategoryL1 updated successfully",
                            result: updatedselect
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
                var statusupdatequery = "update Zone_l1_subcategory_mapping set active_status="+updatestatus+" where master_l1_subcatid="+req.scl1_id+" and zoneid="+req.zoneid;
                var statusupdate = await query(statusupdatequery);
                if(statusupdate.affectedRows > 0){
                    if(updatestatus ==0){
                        var getl2subquery = "select scl2_id from SubcategoryL2 where scl1_id="+req.scl1_id
                        var getl2sub = await query(getl2subquery);
                        if(getl2sub.length > 0){
                            var l2sub = [];
                            for (let i = 0; i < getl2sub.length; i++) {
                                l2sub.push(getl2sub[i].scl2_id);                            
                            }
                            var updatel2subtatusquery = "update Zone_l2_subcategory_mapping set active_status=0 where master_l2_subcatid IN("+l2sub+") and zoneid="+req.zoneid;
                            var updatel2subtatus = await query(updatel2subtatusquery);

                            var getproductsquery = "select pid from ProductMaster where scl1_id="+req.scl1_id
                            var getproducts = await query(getproductsquery);
                            if(getproducts.length > 0){
                                var products = [];
                                for (let j = 0; j < getproducts.length; j++) {
                                    products.push(getproducts[j].pid);                            
                                }
                                var updateproductstatusquery = "update Product_live set live_status=0 where pid IN("+products+") and zoneid="+req.zoneid;
                                var updateproductstatus = await query(updateproductstatusquery); 
                            }                            
                        }                        
                    }
                    var updatedselectquery = "select sl1.scl1_id,sl1.name,zl1sc.active_status from SubcategoryL1 as sl1 left join Zone_l1_subcategory_mapping as zl1sc on zl1sc.master_l1_subcatid=sl1.scl1_id where scl1_id="+req.scl1_id+" group by sl1.scl1_id";
                    var updatedselect = await query(updatedselectquery);
                    let resobj = {
                        success: true,
                        status: true,
                        message: "SubcategoryL1 updated successfully",
                        result: updatedselect
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
    if(req.scl2_id && req.zoneid){
        var gatstatusquery = "select active_status from Zone_l2_subcategory_mapping where master_l2_subcatid="+req.scl2_id+" and zoneid="+req.zoneid;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].active_status ==0){
                updatestatus = 1;
            }

            if(updatestatus == 1){
                var checkprevousstatesquery = "select sl2.scl2_id,zcm.master_catid as catid,zcm.active_status cat_status,sl2.scl1_id,zl1sc.active_status as scl1_status from SubcategoryL2 as sl2 left join Zone_l1_subcategory_mapping as zl1sc on zl1sc.master_l1_subcatid=sl2.scl1_id left join SubcategoryL1 as sl1 on sl1.scl1_id=sl2.scl1_id left join Zone_category_mapping as zcm on zcm.master_catid=sl1.catid where sl2.scl2_id="+req.scl2_id+" and zl1sc.zoneid="+req.zoneid+" and zcm.zoneid="+req.zoneid;
                var checkprevousstates = await query(checkprevousstatesquery);
                //console.log("checkprevousstates --->",checkprevousstates);
                if(checkprevousstates[0].scl1_status==0){
                    //console.log("l1 sub out");
                    let resobj = {
                        success: true,
                        status: false,
                        message: "product can be lived only if L1 subcategory should be mode live",
                    };
                    result(null, resobj);
                }else if(checkprevousstates[0].cat_status==0){
                    //console.log("l2 sub out");
                    let resobj = {
                        success: true,
                        status: false,
                        message: "product can be lived only if category should be mode live",
                    };
                    result(null, resobj);
                }else{
                    var statusupdatequery = "update Zone_l2_subcategory_mapping set active_status="+updatestatus+" where master_l2_subcatid="+req.scl2_id+" and zoneid="+req.zoneid;
                    var statusupdate = await query(statusupdatequery);
                    if(statusupdate.affectedRows > 0){
                        var updatedselectquery = "select scl2.scl2_id,scl2.name,zl2sc.active_status from SubcategoryL2 as scl2 left join Zone_l2_subcategory_mapping as zl2sc on zl2sc.master_l2_subcatid=scl2.scl2_id where scl2.scl2_id="+req.scl2_id+" and zl2sc.zoneid="+req.zoneid;
                        var updatedselect = await query(updatedselectquery);
                        let resobj = {
                            success: true,
                            status: true,
                            message: "SubcategoryL2 updated successfully",
                            result: updatedselect
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
                var statusupdatequery = "update Zone_l2_subcategory_mapping set active_status="+updatestatus+" where master_l2_subcatid="+req.scl2_id+" and zoneid="+req.zoneid;
                var statusupdate = await query(statusupdatequery);
                if(statusupdate.affectedRows > 0){
                    var getproductsquery = "select * from ProductMaster where scl2_id="+req.scl2_id;
                    var getproducts = await query(getproductsquery);
                    if(getproducts.length>0){
                        if(updatestatus ==0){
                            var updateproducts = [];
                            for (let i = 0; i < getproducts.length; i++) {
                                updateproducts.push(getproducts[i].pid);                            
                            }
                            var updateproductstatusquery = "update Product_live set live_status=0 where pid IN("+updateproducts+") and zoneid="+req.zoneid;
                            var updateproductstatus = await query(updateproductstatusquery);                           
                        }                    
                    }
                    var updatedselectquery = "select scl2.scl2_id,scl2.name,zl2sc.active_status from SubcategoryL2 as scl2 left join Zone_l2_subcategory_mapping as zl2sc on zl2sc.master_l2_subcatid=scl2.scl2_id where scl2.scl2_id="+req.scl2_id+" and zl2sc.zoneid="+req.zoneid;
                    var updatedselect = await query(updatedselectquery);
                    let resobj = {
                        success: true,
                        status: true,
                        message: "SubcategoryL2 updated successfully",
                        result: updatedselect
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
    if(req.pid && req.zoneid){
        var gatstatusquery = "select live_status from Product_live  where pid="+req.pid+" and zoneid="+req.zoneid;
        var gatstatus = await query(gatstatusquery);
        if(gatstatus.length>0){
            var updatestatus = 0;
            if(gatstatus[0].live_status ==0){
                updatestatus = 1;
            }

            if(updatestatus==1){
                var productcheckl2query = "select * from ProductMaster where pid="+req.pid;
                var productcheckl2 = await query(productcheckl2query);
                if(productcheckl2.length>0){
                    if(productcheckl2[0].scl2_id){
                        var checkprevousstatesquery = "select pm.pid,zcm.master_catid as catid,zcm.active_status cat_status,pm.scl1_id,zl1sc.active_status as scl1_status,pm.scl2_id,zl2sc.active_status as scl2_status from ProductMaster as pm left join Zone_l2_subcategory_mapping as zl2sc on zl2sc.master_l2_subcatid=pm.scl2_id left join Zone_l1_subcategory_mapping as zl1sc on zl1sc.master_l1_subcatid=pm.scl1_id left join SubcategoryL1 as sl1 on sl1.scl1_id=pm.scl1_id left join Zone_category_mapping as zcm on zcm.master_catid=sl1.catid where pm.pid="+req.pid+" and zl2sc.zoneid="+req.zoneid+" and zl1sc.zoneid="+req.zoneid+" and zcm.zoneid="+req.zoneid;
                        var checkprevousstates = await query(checkprevousstatesquery);
                        if(checkprevousstates[0].scl2_status==0){
                            //console.log("l2 sub out");
                            let resobj = {
                                success: true,
                                status: false,
                                message: "product can be lived only if L2 subcategory should be mode live",
                            };
                            result(null, resobj);
                        }else if(checkprevousstates[0].scl1_status==0){
                            //console.log("l1 sub out");
                            let resobj = {
                                success: true,
                                status: false,
                                message: "product can be lived only if L1 subcategory should be mode live",
                            };
                            result(null, resobj);
                        }else if(checkprevousstates[0].cat_status==0){
                            //console.log("l2 sub out");
                            let resobj = {
                                success: true,
                                status: false,
                                message: "product can be lived only if category should be mode live",
                            };
                            result(null, resobj);
                        }else{
                            //console.log("done");
                            var statusupdatequery = "update Product_live set live_status="+updatestatus+" where pid="+req.pid+" and zoneid="+req.zoneid;
                            var statusupdate = await query(statusupdatequery);
                            if(statusupdate.affectedRows > 0){
                                var updatedselectquery = "select pm.pid,pm.Productname,pl.live_status from ProductMaster as pm left join Product_live as pl on pl.pid=pm.pid where pl.pid="+req.pid+" and pl.zoneid="+req.zoneid;
                                var updatedselect = await query(updatedselectquery);
                                let resobj = {
                                    success: true,
                                    status: true,
                                    message: "ProductMaster updated successfully",
                                    result: updatedselect
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
                        var checkprevousstatesquery = "select pm.pid,zcm.master_catid as catid,zcm.active_status cat_status,pm.scl1_id,zl1sc.active_status as scl1_status,pm.scl2_id,zl2sc.active_status as scl2_status from ProductMaster as pm left join Zone_l2_subcategory_mapping as zl2sc on zl2sc.master_l2_subcatid=pm.scl2_id left join Zone_l1_subcategory_mapping as zl1sc on zl1sc.master_l1_subcatid=pm.scl1_id left join SubcategoryL1 as sl1 on sl1.scl1_id=pm.scl1_id left join Zone_category_mapping as zcm on zcm.master_catid=sl1.catid where pm.pid="+req.pid+" and zl1sc.zoneid="+req.zoneid+" and zcm.zoneid="+req.zoneid;
                        var checkprevousstates = await query(checkprevousstatesquery);
                        if(checkprevousstates[0].scl2_status==0){
                            //console.log("l2 sub out");
                            let resobj = {
                                success: true,
                                status: false,
                                message: "product can be lived only if L2 subcategory should be mode live",
                            };
                            result(null, resobj);
                        }else if(checkprevousstates[0].scl1_status==0){
                            //console.log("l1 sub out");
                            let resobj = {
                                success: true,
                                status: false,
                                message: "product can be lived only if L1 subcategory should be mode live",
                            };
                            result(null, resobj);
                        }else if(checkprevousstates[0].cat_status==0){
                            //console.log("l2 sub out");
                            let resobj = {
                                success: true,
                                status: false,
                                message: "product can be lived only if category should be mode live",
                            };
                            result(null, resobj);
                        }else{
                            //console.log("done");
                            var statusupdatequery = "update Product_live set live_status="+updatestatus+" where pid="+req.pid+" and zoneid="+req.zoneid;
                            var statusupdate = await query(statusupdatequery);
                            if(statusupdate.affectedRows > 0){
                                var updatedselectquery = "select pm.pid,pm.Productname,pl.live_status from ProductMaster as pm left join Product_live as pl on pl.pid=pm.pid where pl.pid="+req.pid+" and pl.zoneid="+req.zoneid;
                                var updatedselect = await query(updatedselectquery);
                                let resobj = {
                                    success: true,
                                    status: true,
                                    message: "ProductMaster updated successfully",
                                    result: updatedselect
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
                    }
                }else{
                    ////Invalid product id////
                    let resobj = {
                        success: true,
                        status: false,
                        message: "invalid product id"
                    };
                    result(null, resobj);
                }         
            }else{
                var statusupdatequery = "update Product_live set live_status="+updatestatus+" where pid="+req.pid+" and zoneid="+req.zoneid;
                var statusupdate = await query(statusupdatequery);
                if(statusupdate.affectedRows > 0){
                    var updatedselectquery = "select pm.pid,pm.Productname,pl.live_status from ProductMaster as pm left join Product_live as pl on pl.pid=pm.pid where pl.pid="+req.pid+" and pl.zoneid="+req.zoneid;
                    var updatedselect = await query(updatedselectquery);
                    let resobj = {
                        success: true,
                        status: true,
                        message: "ProductMaster updated successfully",
                        result: updatedselect
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
    if(req.search && req.zoneid){
        var getsearchquery = "(SELECT ca.catid,ca.name,'categoty' as type FROM Category as ca left join Zone_category_mapping as zcm on zcm.master_catid=ca.catid WHERE zcm.zoneid="+req.zoneid+" and ca.name LIKE '%"+req.search+"%' group by ca.catid) UNION (SELECT sl1.scl1_id,sl1.name,'l1subcategoty' as type FROM SubcategoryL1 as sl1 left join Zone_l1_subcategory_mapping as zl1sm on zl1sm.master_l1_subcatid=sl1.scl1_id WHERE zl1sm.zoneid="+req.zoneid+" and sl1.name LIKE '%"+req.search+"%' group by sl1.scl1_id) UNION (SELECT sl2.scl2_id,sl2.name,'l2subcategoty' as type FROM SubcategoryL2 as sl2 left join Zone_l2_subcategory_mapping as zl2sm on zl2sm.master_l2_subcatid=sl2.scl2_id WHERE zl2sm.zoneid="+req.zoneid+" and sl2.name LIKE '%"+req.search+"%' group by sl2.scl2_id) UNION (SELECT pm.pid,pm.Productname as name,'product' as type FROM ProductMaster as pm left join Product_live as pl on pl.pid=pm.pid WHERE pm.delete_status=0 and pl.zoneid="+req.zoneid+" and pm.Productname LIKE '%"+req.search+"%' group by pm.pid)";
        var getsearch = await query(getsearchquery);
        if(getsearch.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getsearch
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
                var getidsquery = "select catid,scl1_id,image from SubcategoryL1 where scl1_id="+req.id;
                var getids = await query(getidsquery);
                if(getids.length>0){
                    catid = getids[0].catid;
                    scl1_id = getids[0].scl1_id;
                }
                break;
            case 'scl2_id':
                var getidsquery = "select l1.catid,l2.scl1_id,l2.scl2_id,l1.image,l2.image from SubcategoryL2 as l2 left join SubcategoryL1 as l1 on l1.scl1_id=l2.scl1_id where l2.scl2_id="+req.id+" group by l2.scl2_id";
                var getids = await query(getidsquery);
                if(getids.length>0){
                    catid = getids[0].catid;
                    scl1_id = getids[0].scl1_id;
                    scl2_id = getids[0].scl2_id;
                }
                break;
            case 'pid': 
                var getidsquery = "select l1.catid,pm.scl1_id,pm.scl2_id,pm.pid,pm.image from ProductMaster as pm left join SubcategoryL1 as l1 on l1.scl1_id=pm.scl1_id where pm.pid="+req.id+" group by pm.pid";
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
            var categorydataquery = "select catid,name,image,thumbimage,active_status from Category where catid="+catid;
            category = await query(categorydataquery);            
        }

        if(scl1_id>0){
            var l1subcategorydataquery = "select l1.scl1_id,l1.name,l1.active_status,l1.catid,if(scl2_id,1,0) as l2_status,l1.image,l2.image from SubcategoryL1 as l1 left join SubcategoryL2 as l2 on l1.scl1_id=l2.scl1_id where l1.scl1_id="+scl1_id+" group by l1.scl1_id";
            l1subcategory = await query(l1subcategorydataquery);            
        }

        if(scl2_id>0){
            var l2subcategorydataquery = "select scl2_id,name,active_status,scl1_id,image from SubcategoryL2 where scl2_id="+scl2_id;
            l2subcategory = await query(l2subcategorydataquery);            
        }

        if(pid>0){
            var productdataquery = "select pid,Productname,'' as active_status,scl1_id,scl2_id,image from ProductMaster where delete_status=0 and pid="+pid;
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
    if(req.name && req.image && req.zoneid && req.done_by){
        req.created_by = req.done;
        var checkcategoryquery = "select * from Category where name='"+req.name+"' ";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            Category.createCategory(req,async function(err,categoryres){
                if(categoryres.status==true){
                    Catalog.get_zone_list(req,async function(err,zoneres){
                        var lpcount = 0;
                        for (let i = 0; i < zoneres.result.length; i++) {
                            let senddata = [];
                            senddata.push({"zoneid":zoneres.result[i].id,"master_catid":categoryres.result.insertId,"active_status":0});
                            await CategoryMapping.createZoneCategoryMapping(senddata[0], async function(err,productliveres){ });
                        }
                        var getclustersquery = "select * from Cluster_table";
                        var getclusters = await query(getclustersquery);

                        if(getclusters.length>0){
                            for (let j = 0; j < getclusters.length; j++) {
                                var insertCCMdata = [];
                                insertCCMdata.push({"catid":categoryres.result.insertId,"cluid":getclusters[j].cluid,"orderby_category":j+1,"active_status":1});
                                await ClusterCategoryMapping.createClusterCategoryMapping(insertCCMdata[0], async function(err,CCMres){ });
                            }
                        }

                        ////// Catalog History /////////////////
                        var insertcatalogdata = [];
                        insertcatalogdata.push({"id":categoryres.result.insertId,"type_id":1,"action_type":1,"zoneid":req.zoneid,"created_by":req.done_by});
                        await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});

                        let resobj = {
                            success: true,
                            status: true,
                            message: "category added susccessfully"
                        };
                        result(null, resobj);
                    });
                }
            });            
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
    if(req.catid && req.name && req.zoneid && req.done_by){
        var checkcategoryquery = "select * from Category where name='"+req.name+"' and catid NOT IN("+req.catid+")";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            var updatecategory = await Category.updateCategory(req, async function(err,popres){
                if(popres.status == true){
                    ////// Catalog History /////////////////
                    var insertcatalogdata = [];
                    insertcatalogdata.push({"id":req.catid,"type_id":1,"action_type":2,"zoneid":req.zoneid,"created_by":req.done_by});
                    await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});

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
                        message: "somethinfg went wrong plz try again"
                    };
                    result(null, resobj);
                }
            }); 
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
    if(req.name && req.image && req.catid && req.zoneid && req.done_by){
        var checksubcategoryl1query = "select * from SubcategoryL1 where name='"+req.name+"' ";
        var checksubcategoryl1 = await query(checksubcategoryl1query);
        if(checksubcategoryl1.length ==0 ){
            var checkcategoryquery = "select * from Category where catid="+req.catid;
            var checkcategory = await query(checkcategoryquery);
            if(checkcategory.length >0){
                Subcategoryl1.createSubcategoryl1(req,async function(err,subcategory1res){
                    if(subcategory1res.status==true){
                        Catalog.get_zone_list(req,async function(err,zoneres){
                            var lpcount = 0;
                            for (let i = 0; i < zoneres.result.length; i++) {
                                let senddata = [];
                                senddata.push({"zoneid":zoneres.result[i].id,"master_l1_subcatid":subcategory1res.result.insertId,"active_status":0});
                                L1SubCategoryMapping.createL1SubcategoryMapping(senddata[0], async function(err,productliveres){});
                            }
                            ////// Catalog History /////////////////
                            var insertcatalogdata = [];
                            insertcatalogdata.push({"id":subcategory1res.result.insertId,"type_id":2,"action_type":1,"zoneid":req.zoneid,"created_by":req.done_by});
                            await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});
                            let resobj = {
                                success: true,
                                status: true,
                                message: "subcategoryl1 added susccessfully"
                            };
                            result(null, resobj);
                        });
                    }
                });
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
    if(req.scl1_id && req.name && req.zoneid && req.done_by){
        var checkcategoryquery = "select * from SubcategoryL1 where name='"+req.name+"' and scl1_id NOT IN("+req.scl1_id+")";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            var updatesubcategoryl1 = await Subcategoryl1.updateSubcategoryl1(req,async function(err,subl1res){
                if(subl1res.status == true){
                    ////// Catalog History /////////////////
                    var insertcatalogdata = [];
                    insertcatalogdata.push({"id":req.scl1_id,"type_id":2,"action_type":2,"zoneid":req.zoneid,"created_by":req.done_by});
                    await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});

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
                        message: "something went wrong plz try again"
                    };
                    result(null, resobj);
                } 
            });
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
    if(req.name && req.scl1_id && req.zoneid && req.done_by){
        var checksubcategoryl2query = "select * from SubcategoryL2 where name='"+req.name+"' ";
        var checksubcategoryl2 = await query(checksubcategoryl2query);
        if(checksubcategoryl2.length ==0 ){
            var checksubcategoryl1query = "select * from SubcategoryL1 where scl1_id="+req.scl1_id;
            var checksubcategoryl1 = await query(checksubcategoryl1query);
            if(checksubcategoryl1.length >0){
                Subcategoryl2.createSubcategoryl2(req,async function(err,subcategory2res){
                    if(subcategory2res.status==true){
                        Catalog.get_zone_list(req,async function(err,zoneres){
                            var lpcount = 0;
                            for (let i = 0; i < zoneres.result.length; i++) {
                                let senddata = [];
                                senddata.push({"zoneid":zoneres.result[i].id,"master_l2_subcatid":subcategory2res.result.insertId,"active_status":0});
                                L2SubCategoryMapping.createL2SubcategoryMapping(senddata[0], async function(err,productliveres){ });
                            }
                            ////// Catalog History /////////////////
                            var insertcatalogdata = [];
                            insertcatalogdata.push({"id":subcategory2res.result.insertId,"type_id":3,"action_type":1,"zoneid":req.zoneid,"created_by":req.done_by});
                            await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});
                            let resobj = {
                                success: true,
                                status: true,
                                message: "subcategoryl2 added susccessfully"
                            };
                            result(null, resobj);
                        });
                    }
                });
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
    if(req.scl2_id && req.name && req.zoneid && req.done_by){
        var checksubcategoryl2query = "select * from SubcategoryL2 where name='"+req.name+"' and scl2_id NOT IN("+req.scl2_id+")";
        var checksubcategoryl2 = await query(checksubcategoryl2query);
        if(checksubcategoryl2.length ==0 ){
            var updatesubcategoryl2 = await Subcategoryl2.updateSubcategoryl2(req,async function(err,subl2res){
                if(subl2res.status == true){
                    ////// Catalog History /////////////////
                    var insertcatalogdata = [];
                    insertcatalogdata.push({"id":req.scl2_id,"type_id":3,"action_type":2,"zoneid":req.zoneid,"created_by":req.done_by});
                    await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});
                    let resobj = {
                        success: true,
                        status: true,
                        message: "subcategoryl2 Updated susccessfully"
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
          result: getuom
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
          result: getbrand
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

/////////Get Zone List///////////
Catalog.get_zone_list =async function get_zone_list(req,result) {
    var getzonequery = "select id,Zonename from Zone";
    var getzone = await query(getzonequery);
    if(getzone.length > 0){
      let resobj = {
          success: true,
          status: true,
          result: getzone
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

/////////Get Vendor List///////////
Catalog.get_vendor_list =async function get_vendor_list(req,result) {
    var getbrandquery = "select vid,name from Vendor";
    var getbrand = await query(getbrandquery);
    if(getbrand.length > 0){
      let resobj = {
          success: true,
          status: true,
          result: getbrand
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

/////////Get Tag List///////////
Catalog.get_tag_list =async function get_tag_list(req,result) {
    var gettagquery = "select tagid,name from tag";
    var gettag = await query(gettagquery);
    if(gettag.length > 0){
      let resobj = {
          success: true,
          status: true,
          result: gettag
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

/////////File Upload step:1 ->///////////
Catalog.fileUpload = function fileUpload(newDocument,result) {
    if (Object.keys(newDocument.files).length == 0) {
      return result.status(400).send("No files were uploaded.");
    }
    var fileName = newDocument.files.file;
    var name = fileName.name;
    var name = Date.now() + "-" + name;
    
    const params = {
      Bucket: "dailylocally/admin", // pass your bucket name
      Key: name, // file will be saved as testBucket/contacts.csv
      Body: fileName.data,
      ContentType: "image/jpg",
      ACL: "public-read"
    };
    Catalog.documentUpload(params,result);
};

/////////File Upload step:2 ->///////////
Catalog.documentUpload = function documentUpload(params,result) {
    s3.upload(params, (err, data) => {
      if (err) {
        result(err, null);
      } else {
        let resobj = {
          success: true,
          status :true,
          message: "Document uploaded successfully",
          result: data
        };
        result(null, resobj);
      }
    });
}

/////////view Product///////////
Catalog.view_product =async function view_product(req,result) {
    if(req.product_id){
        var getproductquery = "select cat.catid,cat.name as category_name,pm.scl1_id,sc1.name as subcategoryl1_name,pm.scl2_id,sc2.name as subcategory2_name,pm.pid,pm.Productname as productname,pm.weight,uom.uomid,uom.name as uom,pm.packetsize,br.id as brand_id,br.brandname,pm.short_desc,pm.productdetails,'zone mapping' as zonemapping,pm.hsn_code,pm.tag as tag_id,tag.name as tagname,pm.Perishable,pm.vegtype,pm.targetedbaseprice,pm.image,pm.mrp,pm.gst,pm.discount_cost,(pm.mrp-pm.discount_cost) as discountedamount,pm.subscription,pm.combo_flag from ProductMaster as pm left join SubcategoryL1 as sc1 on sc1.scl1_id=pm.scl1_id left join SubcategoryL2 as sc2 on sc2.scl2_id=pm.scl2_id left join Category as cat on cat.catid=sc1.catid left join Brand as br on br.id=pm.brand left join UOM as uom on uom.uomid=pm.uom left join tag as tag on tag.tagid=pm.tag where pm.pid="+req.product_id;
        var getproduct = await query(getproductquery);
        if(getproduct.length > 0 ){
            var getvendorquery = "select vpmid,vpm.vid as vendorid,v.name as vendorname,vpm.expiry_date,vpm.base_price,vpm.other_charges,(vpm.base_price+((vpm.base_price*if(pm.gst,pm.gst,0))/100)) as cost_price from Vendor as v left join Vendor_products_mapping as vpm on vpm.vid=v.vid left join ProductMaster as pm on pm.pid=vpm.pid where vpm.pid="+req.product_id;
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
    if(req && req.zoneid && req.done_by){
        var checkproductquery = "select * from ProductMaster where Productname='"+req.productname+"' ";
        var checkproduct = await query(checkproductquery);
        if(checkproduct.length ==0 ){
            Product.createProduct(req,async function(err,productres){
                if(productres.status==true){
                    if(req.vendor_details.length>0){                        
                        req.vendor_details[0].pid = productres.result.insertId;
                        var vendordetails = req.vendor_details[0];
                        Catalog.add_vendor_product_mapping(vendordetails,async function(err,vendordetailsres){});
                    }
                    Catalog.get_zone_list(req,async function(err,zoneres){
                        var lpcount = 0;
                        for (let i = 0; i < zoneres.result.length; i++) {
                            let senddata = [];
                            senddata.push({"zoneid":zoneres.result[i].id,"pid":productres.result.insertId,"live_status":0});
                            ProductLive.createProductLive(senddata[0], async function(err,productliveres){  }); 
                                                       
                        }
                        ////// Catalog History /////////////////
                        var insertcatalogdata = [];
                        insertcatalogdata.push({"id":productres.result.insertId,"type_id":4,"action_type":1,"zoneid":req.zoneid,"created_by":req.done_by});
                        await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});

                        let resobj = {
                            success: true,
                            status: true,
                            message: "Product added susccessfully"
                        };
                        result(null, resobj);
                    });                    
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        result: productres.result,
                        message: "something went wrong plz try again"
                    };
                    result(null, resobj);
                }
            });
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
    if(req.pid && req.productname && req.zoneid && req.done_by){
        var checkcategoryquery = "select * from ProductMaster where Productname='"+req.productname+"' and pid NOT IN("+req.pid+")";
        var checkcategory = await query(checkcategoryquery);
        if(checkcategory.length ==0 ){
            Product.updateProduct(req,async function(err,productres){
                if(productres.status==true){
                    ////// Catalog History /////////////////
                    var insertcatalogdata = [];
                    insertcatalogdata.push({"id":req.pid,"type_id":4,"action_type":2,"zoneid":req.zoneid,"created_by":req.done_by});
                    await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});
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
                        message: "somthing went wrong plz try again"
                    };
                    result(null, resobj);
                }
            });            
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

/////////Delete Product///////////
Catalog.delete_product =async function delete_product(req,result) {
    if(req.pid && req.zoneid && req.done_by){
        req.delete_status=1;
        Product.updateProduct(req,async function(err,productres){
            if(productres.status==true){
                ////// Catalog History /////////////////
                var insertcatalogdata = [];
                insertcatalogdata.push({"id":req.pid,"type_id":4,"action_type":3,"zoneid":req.zoneid,"created_by":req.done_by});
                await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});
                let resobj = {
                    success: true,
                    status: true,
                    message: "Product deleted susccessfully"
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "somthing went wrong plz try again"
                };
                result(null, resobj);
            }
        });         
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////// Add Vendor Product Mapping ////////////////
Catalog.add_vendor_product_mapping =async function add_vendor_product_mapping(req,result) {
    if(req.pid && req.vid && req.zoneid && req.done_by){  
        var checkvendorquery = "select * from Vendor_products_mapping where pid="+req.pid+" and vid="+req.vid+" and date(expiry_date) >= CURDATE()";
        var checkvendor = await query(checkvendorquery);
        if(checkvendor.length == 0){
            await VendorProductMapping.createVendorProductMapping(req,async function(err,vendorproductmapres){
                if(vendorproductmapres.status==true){ 
                    ////// Catalog History /////////////////
                    var insertcatalogdata = [];
                    insertcatalogdata.push({"id":vendorproductmapres.result.insertId,"type_id":5,"action_type":1,"zoneid":req.zoneid,"created_by":req.done_by});
                    await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});
                    let resobj = {
                        success: true,
                        status: true,
                        message: "vendor added susccessfully"
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
                message: "already this product mapped to this vendor"
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
    if(req.vpmid && req.zoneid && req.done_by){        
        VendorProductMapping.updateVendorProductMapping(req,async function(err,vendorproductmapres){
            if(vendorproductmapres.status==true){ 
                ////// Catalog History /////////////////
                var insertcatalogdata = [];
                insertcatalogdata.push({"id":req.vpmid ,"type_id":5,"action_type":2,"zoneid":req.zoneid,"created_by":req.done_by});
                await CatalogLog.createCatalogLog(insertcatalogdata[0],async function(err,catalogres){});
                let resobj = {
                    success: true,
                    status: true,
                    message: "vendor Updated susccessfully"
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
            message: "check your post value"
        };
        result(null, resobj);
    }
};

/////////Search Catalog///////////
Catalog.home_quick_search =async function home_quick_search(req,result) {
    var userdetails = await query("select * from User where userid = "+req.userid+" ");    
    var servicable_status = true;
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
  
        // (SELECT name,'1' as type,catid as id,catid as id1 FROM Category WHERE name LIKE '%"+req.search+"%') UNION (SELECT name,'2' as type,scl1_id as id,scl1_id as id1  FROM SubcategoryL1 WHERE name LIKE '%"+req.search+"%') UNION (SELECT name,'3' as type,scl2_id as id,scl1_id as id1 FROM SubcategoryL2 WHERE name LIKE '%"+req.search+"%') UNION (SELECT Productname as name,'4' as type,pid as id,pid as id1 FROM ProductMaster WHERE Productname LIKE '%"+req.search+"%')
        //  var getsearch = await query(getsearchquery);
  
      if(req.search){
        var suggestion_list = {};
        var products_title ='Products';
        var offer = 'offer';
        var products_list  = await query("SELECT pm.Productname ,'4' as type,pl.vpid,pm.scl1_id,pm.scl2_id,sub1.name,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname,IF(pm.uom= 1 || pm.uom=7 , sum(pm.weight*1000),pm.weight)as weight,IF(pm.discount_cost=0,false,true)as discount_cost_status,IF(pm.discount_cost=0,0,pm.mrp-pm.discount_cost)as mrp_discount_amout,'offer','"+offer+"',pm.short_desc,pm.packetsize,pm.subscription,discount_cost,pm.image FROM ProductMaster pm  join Product_live pl on pl.pid = pm.pid left join SubcategoryL1 as sub1 on sub1.scl1_id=pm.scl1_id left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand WHERE  pl.live_status=1 and pm.Productname LIKE '%"+req.search+"%' group by pl.vpid ");
        if (products_list.length !=0) {
            suggestion_list.products_title=products_title;
            suggestion_list.products_list=products_list;
        }

        var subcategory_title = 'Sub category';
        var subcategory_list = await query("SELECT sub1.name as sub_category,sub1.scl1_id,sub1.catid,cat.name as category_name FROM  SubcategoryL1 as sub1 left join Category cat on cat.catid=sub1.scl1_id   left join Zone_l1_subcategory_mapping zl1 on zl1.master_l1_subcatid =sub1.scl1_id WHERE  zl1.active_status=1 and  sub1.name LIKE '%"+req.search+"%' group by sub1.scl1_id");
        if (subcategory_list.length !=0) {
            suggestion_list.subcategory_title=subcategory_title;
            suggestion_list.subcategory_list=subcategory_list;
        }

        // var category_title= "Category";
        // var category_list  = await query("SELECT catid,image,name FROM  Category WHERE name LIKE '%"+req.search+"%'");
        // if (category_list.length !=0) {
        //     suggestion_list.category_title=category_title;
        //     suggestion_list.category_list=category_list;
        // }

        // if(suggestion_list.length == 0){
            let resobj = {
                success: true,
                status: true,
                servicable_status:servicable_status,
                result: suggestion_list
            };
            result(null, resobj);
        //   }else{
        //       let resobj = {
        //           success: true,
        //           status: false,
        //           message: "no records found"
        //       };
        //       result(null, resobj);
        //   }
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
    Productlist.get_product_search(req,async function(err,res3) {
        if (err) {
          result(err, null);
        } else {
            console.log(res3);
            result(null, res3);         
        }
    });
    
    // if(req.type){        
    // if (req.type==1) {        
    //     req.catid=req.id;
    //     sub_category_L1.get_Sub_Category_L1_list(req,async function(err,res3) {
    //         if (err) {
    //           result(err, null);
    //         } else {
    //             console.log(res3);    
    //             result(null, res3);                               
    //         }
    //     });
    // }else if (req.type==2) {        
    //     req.scl1_id=req.id;
    //     Sub_Category_L2.get_Sub_Category_L2_list(req,async function(err,res3) {
    //         if (err) {
    //           result(err, null);
    //         } else {
    //             console.log(res3);    
    //             result(null, res3);             
    //         }
    //       });
    // }else if (req.type==3) {
    //     req.scl2_id=req.id;
    //     Productlist.get_ProductMaster_list(req,async function(err,res3) {
    //         if (err) {
    //           result(err, null);
    //         } else {
    //             console.log(res3);    
    //             result(null, res3);                                             
    //         }
    //     });
    // }else{
    //     // /req.scl2_id=req.id;
    //     Productlist.get_product_search(req,async function(err,res3) {
    //         if (err) {
    //           result(err, null);
    //         } else {
    //             console.log(res3);    
    //             result(null, res3);             
    //         }
    //       });
    // }
    //     var catid = 0;
    //     var scl1_id = 0;
    //     var scl2_id = 0;
    //     var pid = 0;

    //     // var category =[];
    //     // var l1subcategory =[];
    //     // var l2subcategory =[];
    //     // var product =[];

    //     // switch (req.type) {
    //     //     case 1:            
    //     //         catid=req.id;
    //     //         // var getidsquery = "select * from Category where catid="+req.id;
    //     //         // var getids = await query(getidsquery);
    //     //         // if(getids.length>0){
    //     //         //     catid = getids[0].catid;
    //     //         //     scl1_id = getids[0].scl1_id;
    //     //         // }
         
    //     //         break;
    //     //     case 2:
    //     //         var getidsquery = "select catid,scl1_id from SubcategoryL1 where scl1_id="+req.id;
    //     //         var getids = await query(getidsquery);
    //     //         if(getids.length>0){
    //     //             catid = getids[0].catid;
    //     //             scl1_id = getids[0].scl1_id;
    //     //         }
    //     //         break;
    //     //     case 3:
    //     //         var getidsquery = "select l1.catid,l2.scl1_id,l2.scl2_id from SubcategoryL2 as l2 left join SubcategoryL1 as l1 on l1.scl1_id=l2.scl1_id where l2.scl2_id="+req.id+" group by l2.scl2_id";
    //     //         var getids = await query(getidsquery);
    //     //         if(getids.length>0){
    //     //             catid = getids[0].catid;
    //     //             scl1_id = getids[0].scl1_id;
    //     //             scl2_id = getids[0].scl2_id;
    //     //         }
    //     //         break;
    //     //     case 4: 
    //     //         var getidsquery = "select l1.catid,pm.scl1_id,pm.scl2_id,pm.pid from ProductMaster as pm left join SubcategoryL1 as l1 on l1.scl1_id=pm.scl1_id where pm.pid="+req.id+" group by pm.pid";
    //     //         var getids = await query(getidsquery);
    //     //         if(getids.length>0){
    //     //             catid = getids[0].catid;
    //     //             scl1_id = getids[0].scl1_id;
    //     //             scl2_id = getids[0].scl2_id;
    //     //             pid = getids[0].pid;
    //     //         }
    //     //         break;        
    //     //     default:
    //     //         break;
    //     // }

    //     // if(catid>0){
    //     //     var categorydataquery = "select catid,name,active_status from Category where catid="+catid;
    //     //     category = await query(categorydataquery);            
    //     // }

    //     // if(scl1_id>0){
    //     //     var l1subcategorydataquery = "select l1.scl1_id,l1.name,l1.active_status,l1.catid,if(scl2_id,1,0) as l2_status from SubcategoryL1 as l1 left join SubcategoryL2 as l2 on l1.scl1_id=l2.scl1_id where l1.scl1_id="+scl1_id+" group by l1.scl1_id";
    //     //     l1subcategory = await query(l1subcategorydataquery);            
    //     // }

    //     // if(scl2_id>0){
    //     //     var l2subcategorydataquery = "select scl2_id,name,active_status,scl1_id from SubcategoryL2 where scl2_id="+scl2_id;
    //     //     l2subcategory = await query(l2subcategorydataquery);            
    //     // }

    //     // if(pid>0){
    //     //     var productdataquery = "select pid,Productname,active_status,scl1_id,scl2_id from ProductMaster where pid="+pid;
    //     //     product = await query(productdataquery);            
    //     // }
        
    //     // let resobj = {
    //     //     success: true,
    //     //     status: true,
    //     //     category: category,
    //     //     l1subcategory:l1subcategory,
    //     //     l2subcategory:l2subcategory,
    //     //     product:product
    //     // };
    //     // result(null, resobj);        
    // }else{
    //     let resobj = {
    //         success: true,
    //         status: false,
    //         message: "check your post value"
    //     };
    //     result(null, resobj);
    // }
};

///////// update_category_collection_list///////////
Catalog.update_category_collection_list =async function update_category_collection_list(req,result) {
    // layoutconstant.layout_rowcount = req.layout_rowcount

    // console.log("layoutconstant",req.layout_rowcount);
    // const newObj = {
    //     layout_rowcount: '2'
    // }

    // console.log("newObj",newObj);

    // let student = { 
    //     name: 'Mike',
    //     age: 23, 
    //     gender: 'Male',
    //     department: 'English',
    //     car: 'Honda' 
    // };
     
    //  let data = JSON.stringify(student, null, 2);
    // console.log("data",data);
    // fs.writeFileSync('student-3.json', data);

    // fs.writeFile('student-3.json', data, (err) => {
    //     if (err) throw err;
    //     console.log('Data written to file');
    // });
    
    // console.log('This is after the write call');


    let category = req.categorylist || [] ;
    let collection = req.collectionlist || [] ;
    
        for (let i = 0; i < category.length; i++) {
            if (category[i].type==1) {
                var updatequery = "update Category set  layout_position='"+category[i].layout_position+"' where catid = '"+category[i].catid+"' ";
                var updatequeryids = await query(updatequery);
            } else {
                var updatequery = "update Collections set  layout_position='"+category[i].layout_position+"' where cid = '"+category[i].catid+"' ";
                var updatequeryids = await query(updatequery);
            }
        
        
        }

        for (let j = 0; j < collection.length; j++) {
        
            var updatequery = "update Collections set  layout_position='"+collection[j].layout_position+"' where cid = '"+collection[j].cid+"' ";
            var updatequeryids = await query(updatequery);
        }


    let resobj = {
                success: true,
                status: true,
                message: "layout has been changed successfully"
            };
            result(null, resobj);
};

module.exports = Catalog;