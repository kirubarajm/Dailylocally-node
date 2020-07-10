"user strict";
var sql     = require('../db.js');
const util  = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant= require('../constant.js');
var request = require('request');
let jwt     = require('jsonwebtoken');
let config  = require('../config.js');
var moment  = require('moment');
var PO = require('../tableModels/poTableModel.js');
var POProducts = require('../tableModels/poproductsTableModel.js');
var QC_check_list = require("../tableModels/qualitychecklistTableModel.js");
var Stock = require('../tableModels/stockTableModel.js');
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require('constants');
var Stockkeeping = require('../tableModels/stockkeepingTableModel.js');


var StockKeeping = function(stockkeeping) {};

//////////show Stockkeeping Open List///////////
StockKeeping.stockkeeping_list =async function stockkeeping_list(req,result) {
    if(req.zone_id){
        var where = "";
        if(req.cat_id){
            where = where+" and cat_id="+req.cat_id+" ";
        }
        if(req.scl1_id){
            where = where+" and scl1_id="+req.scl1_id+" ";
        }
        if(req.type){
            where = where+" and type="+req.type+" ";
        }
        if(req.date){
            where = where+" and date(created_at)='"+req.date+"' ";
        }

        var stockkeppinglistquery = "select * from StockKeeping where zoneid="+req.zone_id+" "+where+" order by created_at DESC";
        var stockkeppinglist = await query(stockkeppinglistquery);
        if(stockkeppinglist.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: stockkeppinglist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no stock found"
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

//////////show Stockkeeping Open List///////////
StockKeeping.stockkeeping_openlist =async function stockkeeping_openlist(req,result) {
    if(req.zone_id){
        var showopenstockquery = "select pl.zoneid,pl.vpid,pm.Productname,cat.catid,cat.name as catagory_name,scl1.scl1_id,scl1.name as subcatL1name,scl2.scl2_id,scl2.name as subcatL2name,pm.uom as uomid,uom.name as uom_name,if(st.quantity,st.quantity,0) as boh,pm.mrp,if(sum(case when dop.scm_status=3 then dop.received_quantity end),sum(case when dop.scm_status=3 then dop.received_quantity end),0)  as insorting from Product_live as pl left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL2 as scl2 on scl2.scl2_id=pm.scl2_id left join SubcategoryL1 as scl1 on scl1.scl1_id=pm.scl1_id left join Category as cat on cat.catid=scl1.catid left join UOM as uom on uom.uomid=pm.uom left join Stock as st on st.vpid=pl.vpid left join Dayorder_products as dop on dop.vpid=st.vpid where pl.zoneid="+req.zone_id+" and st.vpid NOT IN(select vpid from StockKeeping where date(created_at)=CURDATE() and delete_status=0) group by pl.vpid";
        var showopenstock = await query(showopenstockquery);
        if(showopenstock.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: showopenstock
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no stock found"
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

/////////Stockkeeping Add///////////
StockKeeping.stockkeeping_add =async function stockkeeping_add(req,result) {
    if(req.zone_id && req.stockid && req.vpid){
        var checkSKquery = "select * from StockKeeping where zoneid="+req.zone_id+" and vpid="+req.vpid+" and date(created_at)=CURDATE() and delete_status=0";
        var checkS = await query(checkSKquery);
        if(checkS.length==0){
            if(req.actual_quantity){  var actual_quantity=req.actual_quantity; }else{ var actual_quantity=0; }
            if(req.missing_quantity){  var missing_quantity=req.missing_quantity; }else{ var missing_quantity=0; }
            if(req.wastage){  var wastage=req.wastage; }else{ var wastage=0; }
            if(req.wastage_image){  var wastage_image=req.wastage_image; }else{ var wastage_image=""; }
            if(req.type){  var type=req.type; }else{ var type=0; }        

            var getotherquery = "select st.stockid,st.vpid,pm.Productname,pm.weight,cat.catid,cat.name as catagory_name,scl1.scl1_id,scl1.name as subcatL1name,scl2.scl2_id,scl2.name as subcatL2name,pm.uom as uomid,uom.name as uom_name,st.quantity as boh,pm.mrp,sum(dop.received_quantity) as insorting from Stock as st left join Product_live as pl on pl.vpid=st.vpid left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL2 as scl2 on scl2.scl2_id=pm.scl2_id left join SubcategoryL1 as scl1 on scl1.scl1_id=pm.scl1_id left join Category as cat on cat.catid=scl1.catid left join UOM as uom on uom.uomid=pm.uom left join Dayorder_products as dop on dop.vpid=st.vpid where st.vpid="+req.stockid+" and st.zoneid="+req.zone_id+" and st.vpid="+req.vpid+" and dop.scm_status=3 group by st.vpid";
            var getother = await query(getotherquery);

            if(getother.length>0){
                var sklist = [];
                sklist.push({"stockid":req.stockid,"vpid":req.vpid,"product_name":getother[0].Productname,"cat_id":getother[0].catid,"category_name":getother[0].catagory_name,"scl1_id":getother[0].scl1_id,"subcategoryl1_name":getother[0].subcatL1name,"scl2_id":getother[0].scl2_id,"subcategoryl2_name":getother[0].subcatL2name,"price":getother[0].mrp,"missing_quantity":missing_quantity,"boh":getother[0].boh,"actual_quantity":actual_quantity,"in_sorting":getother[0].insorting,"type":type,"wastage":wastage,"wastage_image":wastage_image,"zoneid":req.zone_id,"commend":getother[0].Productname,"weight":getother[0].weight});
                /////////create stockkeeping//////////
                Stockkeeping.createStockKeeping(sklist, async function(err,skres){
                    if(skres.success==true){
                        /////////Update Stock//////////
                        var stockupdatequery = "update Stock set quantity="+actual_quantity+" where stockid="+req.stockid;
                        var stockupdate = await query(stockupdatequery);
                        if(stockupdate.affectedRows>0){
                            let resobj = {
                                success: true,
                                status: true,
                                message: "stock updated successfully"
                            };
                            result(null, resobj);
                        }else{
                            let resobj = {
                                success: true,
                                status: true,
                                message: "something went wrong plz try again in stock"
                            };
                            result(null, resobj);
                        }                    
                    }else{
                        let resobj = {
                            success: true,
                            status: true,
                            message: "something went wrong plz try again in stock keeping"
                        };
                        result(null, resobj);
                    }
                });
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "no stock found"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "already in stockkeeping"
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

/////////Stockkeeping View///////////
StockKeeping.stockkeeping_view =async function stockkeeping_view(req,result) {
    if(req.zone_id && req.skid){
        var getskquery = "select * from StockKeeping where zoneid="+req.zone_id+" and skid="+req.skid;
        var getsk = await query(getskquery);
        if(getsk.length>0){            
            /////////Update Stock//////////
            let resobj = {
                success: true,
                status: true,
                result: getsk
            };
            result(null, resobj);               
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no stock keeping data's"
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

/////////Stockkeeping Edit///////////
StockKeeping.stockkeeping_edit =async function stockkeeping_edit(req,result) {
    if(req.zone_id && req.skid){
        var checkskquery = "select * from StockKeeping where zoneid="+req.zone_id+" and skid="+req.skid;
        var checksk = await query(checkskquery);
        if(checksk.length>0){
            var updateskquery = "update StockKeeping set actual_quantity="+req.actual_quantity+",missing_quantity="+req.missing_quantity+",wastage="+req.wastage+",wastage_image='"+req.wastage_image+"',type="+req.type+" where zoneid="+req.zone_id+" and skid="+req.skid;
            var updatesk = await query(updateskquery);
            if(updatesk.affectedRows>0){          
                /////////Update Stock//////////
                var stockupdatequery = "update Stock set quantity="+req.actual_quantity+" where stockid="+checksk[0].stockid;
                var stockupdate = await query(stockupdatequery);
                if(stockupdate.affectedRows>0){
                    let resobj = {
                        success: true,
                        status: true,
                        mesage: "updated successfully"
                    };
                    result(null, resobj);
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "something went wrong plz try again in Stock"
                    };
                    result(null, resobj);
                }               
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "something went wrong plz try again"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: true,
                mesage: "invalid skid"
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

/////////Stockkeeping Delete///////////
StockKeeping.stockkeeping_delete =async function stockkeeping_delete(req,result) {
    if(req.zone_id && req.skid){
        var checkskquery = "select * from StockKeeping where zoneid="+req.zone_id+" and skid="+req.skid;
        var checksk = await query(checkskquery);
        if(checksk.length>0){ 
            if(checksk[0].delete_status==0){
                var updateskquery = "update StockKeeping set delete_status=1 where zoneid="+req.zone_id+" and skid="+req.skid;
                var updatesk = await query(updateskquery);
                if(updatesk.affectedRows>0){          
                    /////////Update Stock//////////
                    var stockupdatequery = "update Stock set quantity="+checksk[0].boh+" where stockid="+checksk[0].stockid;
                    var stockupdate = await query(stockupdatequery);
                    if(stockupdate.affectedRows>0){
                        let resobj = {
                            success: true,
                            status: true,
                            mesage: "updated successfully"
                        };
                        result(null, resobj);
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "something went wrong plz try again in Stock"
                        };
                        result(null, resobj);
                    }                                   
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "something went wrong plz try again in StockKeeping"
                    };
                    result(null, resobj);
                }
            }else{
                let resobj = {
                    success: true,
                    status: true,
                    mesage: "already in delete state"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: true,
                mesage: "invalid skid"
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

module.exports = StockKeeping;