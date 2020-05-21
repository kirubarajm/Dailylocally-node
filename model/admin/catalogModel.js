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

module.exports = Catalog;