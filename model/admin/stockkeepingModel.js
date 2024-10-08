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
var Stock = require('../tableModels/stockTableModel.js');
var MissingQuantityReport = require('../tableModels/missingquantityreportTableModel.js');
var WasteManagement = require('../tableModels/wastemanagementTableModel.js');
var StockLog = require('../tableModels/stocklogTableModel.js');
var MissingProducts = require('../tableModels/missingproductsTableModel.js');


var StockKeeping = function(stockkeeping) {};

//////////show Stockkeeping Open List///////////
StockKeeping.stockkeeping_list =async function stockkeeping_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

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
        if(req.from_date && req.to_date){
            where = where+" and (date(created_at) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }

        if(req.report && req.report==1){
            var stockkeppinglistquery = "select * from StockKeeping where zoneid="+req.zoneid+" "+where+" order by created_at DESC";
        }else{
            var stockkeppinglistquery = "select * from StockKeeping where zoneid="+req.zoneid+" "+where+" order by created_at DESC limit " +startlimit +"," +pagelimit +" ";
        }        
        var stockkeppinglist = await query(stockkeppinglistquery);

        var totalcountquery = "select * from StockKeeping where zoneid="+req.zoneid+" "+where+" order by created_at DESC";
        var total_count = await query(totalcountquery);        
        if(stockkeppinglist.length > 0){
            var totalcount = total_count.length;
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: stockkeppinglist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no stock found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            totalcount: 0,
            message: "check your post values"
        };
        result(null, resobj);
    }  
};

//////////show Stockkeeping Open List///////////
StockKeeping.stockkeeping_openlist =async function stockkeeping_openlist(req,result) {
    if(req.zoneid){
        var showopenstockquery = "select pl.zoneid,pl.vpid,pm.Productname,cat.catid,cat.name as catagory_name,scl1.scl1_id,scl1.name as subcatL1name,scl2.scl2_id,scl2.name as subcatL2name,pm.uom as uomid,uom.name as uom_name,if(st.quantity,st.quantity,0) as boh,pm.mrp,if(sum(case when dop.scm_status=3 then dop.received_quantity end),sum(case when dop.scm_status=3 then dop.received_quantity end),0)  as insorting from Product_live as pl left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL2 as scl2 on scl2.scl2_id=pm.scl2_id left join SubcategoryL1 as scl1 on scl1.scl1_id=pm.scl1_id left join Category as cat on cat.catid=scl1.catid left join UOM as uom on uom.uomid=pm.uom left join Stock as st on st.vpid=pl.vpid left join Dayorder_products as dop on dop.vpid=st.vpid where pm.Productname!='' and pl.zoneid="+req.zoneid+" and st.vpid NOT IN(select vpid from StockKeeping where date(created_at)=CURDATE() and delete_status=0) group by pl.vpid";
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
    if(req.zoneid && req.vpid){
        var checkSKquery = "select * from StockKeeping where zoneid="+req.zoneid+" and vpid="+req.vpid+" and date(created_at)=CURDATE() and delete_status=0";
        var checkS = await query(checkSKquery);
        if(checkS.length==0){
            if(req.actual_quantity){  var actual_quantity=req.actual_quantity; }else{ var actual_quantity=0; }
            if(req.missing_quantity){  var missing_quantity=req.missing_quantity; }else{ var missing_quantity=0; }
            if(req.wastage){  var wastage=req.wastage; }else{ var wastage=0; }
            if(req.wastage_image){  var wastage_image=req.wastage_image; }else{ var wastage_image=""; }
            if(req.type){  var type=req.type; }else{ var type=0; }
            if(req.purchase_type){  var purchase_type=req.purchase_type; }else{ var purchase_type=0; }
            if(req.purchase_image){  var purchase_image=req.purchase_image; }else{ var purchase_image=""; }   
            if(req.purchase_quantity){  var purchase_quantity=req.purchase_quantity; }else{ var purchase_quantity=0; }   
            if(req.other_purchase_quantity){  var other_purchase_quantity=req.other_purchase_quantity; }else{ var other_purchase_quantity=""; }   
                        
            var checkstockdata = [];
            checkstockdata.push({"vpid":req.vpid,"quantity":0,"zoneid":req.zoneid});
            await StockKeeping.checkstock(checkstockdata[0], async function(err,checkstockdatares){
                if(checkstockdatares.status == true){
                    // var getotherquery = "select st.stockid,st.vpid,pm.Productname,pm.weight,cat.catid,cat.name as catagory_name,scl1.scl1_id,scl1.name as subcatL1name,scl2.scl2_id,scl2.name as subcatL2name,pm.uom as uomid,uom.name as uom_name,st.quantity as boh,pm.mrp from Stock as st left join Product_live as pl on pl.vpid=st.vpid left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL2 as scl2 on scl2.scl2_id=pm.scl2_id left join SubcategoryL1 as scl1 on scl1.scl1_id=pm.scl1_id left join Category as cat on cat.catid=scl1.catid left join UOM as uom on uom.uomid=pm.uom left join Dayorder_products as dop on dop.vpid=st.vpid where st.zoneid="+req.zoneid+" and st.vpid="+req.vpid+" group by st.vpid";

                    var getotherquery = "select st.stockid,st.vpid,pl.pid,vpm.vid,(vpm.base_price+((vpm.base_price*vpm.other_charges)/100)) as cost,pm.Productname,pm.weight,cat.catid,cat.name as catagory_name,scl1.scl1_id,scl1.name as subcatL1name,scl2.scl2_id,scl2.name as subcatL2name,pm.uom as uomid,uom.name as uom_name,st.quantity as boh,pm.mrp from Stock as st left join Product_live as pl on pl.vpid=st.vpid left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL2 as scl2 on scl2.scl2_id=pm.scl2_id left join SubcategoryL1 as scl1 on scl1.scl1_id=pm.scl1_id left join Category as cat on cat.catid=scl1.catid left join UOM as uom on uom.uomid=pm.uom left join Dayorder_products as dop on dop.vpid=st.vpid left join Vendor_products_mapping as vpm on vpm.pid=pl.pid where st.zoneid="+req.zoneid+" and st.vpid="+req.vpid+" group by st.vpid";
                    var getother = await query(getotherquery);
                    if(getother.length>0){
                        var sklist = [];
                        sklist.push({"stockid":getother[0].stockid,"vpid":req.vpid,"product_name":getother[0].Productname,"cat_id":getother[0].catid,"category_name":getother[0].catagory_name,"scl1_id":getother[0].scl1_id,"subcategoryl1_name":getother[0].subcatL1name,"scl2_id":getother[0].scl2_id,"subcategoryl2_name":getother[0].subcatL2name,"price":getother[0].mrp,"missing_quantity":missing_quantity,"boh":getother[0].boh,"actual_quantity":actual_quantity,"in_sorting":getother[0].insorting,"type":type,"purchase_type":purchase_type,"purchase_quantity":purchase_quantity,"other_purchase_quantity":other_purchase_quantity,"purchase_image":purchase_image,"wastage":wastage,"wastage_image":wastage_image,"zoneid":req.zoneid,"commend":getother[0].Productname,"weight":getother[0].weight});
        
                        ////////insert missing quantity/////////
                        if(missing_quantity>0){
                            // var insertmissingdata = [];
                            // insertmissingdata.push({"dopid":0,"vpid":req.vpid,"report_quantity":missing_quantity,"cost":getother[0].cost,"report_type":1,"from_type":3,"zoneid":req.zoneid});                
                            // await MissingQuantityReport.createMissingQuantityReport(insertmissingdata[0], async function(err,missingdatares){});
                            var insertmissingproductdata = [];
                            insertmissingproductdata.push({"dopid":0,"vpid":req.vpid,"quantity":missing_quantity,"cost":getother[0].cost,"zoneid":req.zoneid,"from_type":3});
                            await MissingProducts.createMissingProducts(insertmissingproductdata[0], async function(err,missingproductdatares){ });
                        }                
                        ////////insert waste management/////////
                        if(wastage>0){
                            var insertwastedata = [];
                            insertwastedata.push({"dopid":0,"vpid":req.vpid,"quantity":wastage,"cost":getother[0].cost,"zoneid":req.zoneid,"from_type":3});
                            await WasteManagement.createWasteManagement(insertwastedata[0], async function(err,wastedatares){});
                        }
        
                        /////////create stockkeeping//////////
                        Stockkeeping.createStockKeeping(sklist[0], async function(err,skres){
                            if(skres.success==true){                        
                                /////////Update Stock//////////
                                var stockupdatequery = "update Stock set quantity="+actual_quantity+" where stockid="+getother[0].stockid;
                                var stockupdate = await query(stockupdatequery);
                                if(stockupdate.affectedRows>0){
                                    var stocklogdatain = [];
                                    stocklogdatain.push({"stockid":getother[0].stockid,"vpid":req.vpid,"type":2,"from_type":4,"quantity":actual_quantity,"zoneid":req.zoneid,"created_by":req.done_by});
                                    StockLog.createStockLog(stocklogdatain[0], async function(err,stocklogdatares){ });
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
                        status: true,
                        message: "stock updated issue"
                    };
                    result(null, resobj);
                }
            });            
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

///////////Check Stock//////////////////////
StockKeeping.checkstock =async function checkstock(req,result) {
    var checkstockquery = "select * from Stock where vpid="+req.vpid;
    var checkstock = await query(checkstockquery);
    if(checkstock==0){
        /////////Insert Stock//////////
        var insertstock = [];
        insertstock.push({"vpid":req.vpid,"quantity":0,"zoneid":req.zoneid});
        await Stock.createStock(insertstock[0], async function(err, stockres){
            if(stockres.status==true){
                let resobj = {
                    success: true,
                    status: true,
                    message: "stock inserted successfully"
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
        });
    }else{
        let resobj = {
            success: true,
            status: true,
            message: "product in stock"
        };
        result(null, resobj);
    }
};

/////////Stockkeeping View///////////
StockKeeping.stockkeeping_view =async function stockkeeping_view(req,result) {
    if(req.zoneid && req.skid){
        var getskquery = "select * from StockKeeping where zoneid="+req.zoneid+" and skid="+req.skid;
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
    if(req.zoneid && req.skid){
        var checkskquery = "select * from StockKeeping where zoneid="+req.zoneid+" and skid="+req.skid;
        var checksk = await query(checkskquery);
        if(checksk.length>0){
            var actual_quantity = 0;
            var missing_quantity = 0;
            var wastage_quantity = 0;
            var local_quantity = 0;
            var other_quantity = 0;
            var wastage_image = "";
            var purchase_image = "";

            if(req.actual_quantity){ actual_quantity=req.actual_quantity; }
            if(req.missing_quantity){ missing_quantity=req.missing_quantity; }
            if(req.wastage){ wastage_quantity=req.wastage; }
            if(req.purchase_quantity){ local_quantity=req.purchase_quantity; }
            if(req.other_purchase_quantity){ other_quantity=req.other_purchase_quantity; }
            if(req.wastage_image){ wastage_image=req.wastage_image; }
            if(req.purchase_image){ purchase_image=req.purchase_image; }

            var updateskquery = "update StockKeeping set actual_quantity="+actual_quantity+",missing_quantity="+missing_quantity+",wastage="+wastage_quantity+",wastage_image='"+wastage_image+"',purchase_quantity='"+local_quantity+"',other_purchase_quantity='"+other_quantity+"',purchase_image='"+purchase_image+"',type="+req.type+",purchase_type="+req.purchase_type+" where zoneid="+req.zoneid+" and skid="+req.skid;
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
    if(req.zoneid && req.skid){
        var checkskquery = "select * from StockKeeping where zoneid="+req.zoneid+" and skid="+req.skid;
        var checksk = await query(checkskquery);
        if(checksk.length>0){ 
            if(checksk[0].delete_status==0){
                var updateskquery = "update StockKeeping set delete_status=1 where zoneid="+req.zoneid+" and skid="+req.skid;
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

/////////Wastage List///////////
StockKeeping.wastage_list =async function wastage_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

        var where = "";
        if(req.catagorysearch){
            where = where+" and (cat.catid='"+req.catagorysearch+"' or cat.name='"+req.catagorysearch+"') ";
        }
        if(req.subcategorysearch){
            where = where+" and sc1.scl1_id='"+req.subcategorysearch+"' ";
        }
        if(req.productsearch){
            where = where+" and (pm.pid="+req.productsearch+" or pm.Productname LIKE '%"+req.productsearch+"%' ) ";
        }        
        if(req.from_date && req.to_date){
            where = where+" and (date(wm.created_at) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }

        if(req.report && req.report==1){
            var stockkeppinglistquery = "select wm.waste_id,cat.catid,cat.name as category_name,pm.scl1_id,sc1.name as subcategoryl1_name,pm.scl2_id,sc2.name as subcategory2_name,pm.pid,pm.Productname as productname,uom.uomid,uom.name as uom,wm.vpid,wm.quantity,(wm.cost*wm.quantity) as cost,wm.created_at,case when from_type=1 then 'Sorting' when from_type=2 then 'QA' when from_type=3 then 'Stock Keeping' end as from_type,'' as waste_tillnow,'' as cost_tillnow from Waste_Management as wm left join Product_live as pl on pl.vpid=wm.vpid left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL1 as sc1 on sc1.scl1_id=pm.scl1_id left join SubcategoryL2 as sc2 on sc2.scl2_id=pm.scl2_id left join Category as cat on cat.catid=sc1.catid left join UOM as uom on uom.uomid=pm.uom where wm.waste_id!='' and wm.zoneid="+req.zoneid+" "+where+" group by wm.waste_id";
        }else{
            var stockkeppinglistquery = "select wm.waste_id,cat.catid,cat.name as category_name,pm.scl1_id,sc1.name as subcategoryl1_name,pm.scl2_id,sc2.name as subcategory2_name,pm.pid,pm.Productname as productname,uom.uomid,uom.name as uom,wm.vpid,wm.quantity,(wm.cost*wm.quantity) as cost,wm.created_at,case when from_type=1 then 'Sorting' when from_type=2 then 'QA' when from_type=3 then 'Stock Keeping' end as from_type,'' as waste_tillnow,'' as cost_tillnow from Waste_Management as wm left join Product_live as pl on pl.vpid=wm.vpid left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL1 as sc1 on sc1.scl1_id=pm.scl1_id left join SubcategoryL2 as sc2 on sc2.scl2_id=pm.scl2_id left join Category as cat on cat.catid=sc1.catid left join UOM as uom on uom.uomid=pm.uom where wm.waste_id!='' and wm.zoneid="+req.zoneid+" "+where+" group by wm.waste_id order by wm.created_at DESC limit " +startlimit +"," +pagelimit +" ";
        }  
        var stockkeppinglist = await query(stockkeppinglistquery);

        var totalcountquery = "select * from Waste_Management as wm where wm.waste_id!='' and wm.zoneid="+req.zoneid+" "+where+" order by wm.created_at DESC";
        var total_count = await query(totalcountquery);        
        if(stockkeppinglist.length > 0){
            var getfullcostquery = "select vpid,sum(quantity) as quantity, sum(cost*quantity) as cost from Waste_Management group by vpid";
            var getfullcost = await query(getfullcostquery);

            if(getfullcost.length>0){
                for (let i = 0; i < getfullcost.length; i++) {
                    for (let j = 0; j < stockkeppinglist.length; j++) {
                        if (getfullcost[i].vpid == stockkeppinglist[j].vpid) {
                            stockkeppinglist[j].waste_tillnow = getfullcost[i].quantity;
                            stockkeppinglist[j].cost_tillnow = getfullcost[i].cost;
                        }
                        
                    }
                    
                }
            }

            var totalcount = total_count.length;
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: stockkeppinglist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no stock found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            totalcount: 0,
            message: "check your post values"
        };
        result(null, resobj);
    }  
};

/////////Missing Item List///////////
StockKeeping.missingitem_list =async function missingitem_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

        var where = "";
        if(req.catagorysearch){
            where = where+" and (cat.catid='"+req.catagorysearch+"' or cat.name='"+req.catagorysearch+"') ";
        }
        if(req.subcategorysearch){
            where = where+" and sc1.scl1_id='"+req.subcategorysearch+"' or sc1.name LIKE '%"+req.subcategorysearch+"%' )";
        }
        if(req.productsearch){
            where = where+" and (pm.pid LIKE '%"+req.productsearch+"%' or pm.Productname LIKE '%"+req.productsearch+"%' ) ";
        }        
        if(req.from_date && req.to_date){
            where = where+" and (date(wm.created_at) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }
        if(req.report && req.report==1){
            var stockkeppinglistquery = "select wm.missing_id,cat.catid,cat.name as category_name,pm.scl1_id,sc1.name as subcategoryl1_name,pm.scl2_id,sc2.name as subcategory2_name,pm.pid,pm.Productname as productname,uom.uomid,uom.name as uom,wm.vpid,wm.quantity,(wm.cost*wm.quantity) as cost,wm.created_at,case when from_type=1 then 'Sorting' when from_type=2 then 'QA' when from_type=3 then 'Stock Keeping' end as from_type,'' as waste_tillnow,'' as cost_tillnow from Missing_Products as wm left join Product_live as pl on pl.vpid=wm.vpid left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL1 as sc1 on sc1.scl1_id=pm.scl1_id left join SubcategoryL2 as sc2 on sc2.scl2_id=pm.scl2_id left join Category as cat on cat.catid=sc1.catid left join UOM as uom on uom.uomid=pm.uom where wm.missing_id!='' and wm.zoneid="+req.zoneid+" "+where+" group by wm.missing_id";
        }else{
            var stockkeppinglistquery = "select wm.missing_id,cat.catid,cat.name as category_name,pm.scl1_id,sc1.name as subcategoryl1_name,pm.scl2_id,sc2.name as subcategory2_name,pm.pid,pm.Productname as productname,uom.uomid,uom.name as uom,wm.vpid,wm.quantity,(wm.cost*wm.quantity) as cost,wm.created_at,case when from_type=1 then 'Sorting' when from_type=2 then 'QA' when from_type=3 then 'Stock Keeping' end as from_type,'' as waste_tillnow,'' as cost_tillnow from Missing_Products as wm left join Product_live as pl on pl.vpid=wm.vpid left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL1 as sc1 on sc1.scl1_id=pm.scl1_id left join SubcategoryL2 as sc2 on sc2.scl2_id=pm.scl2_id left join Category as cat on cat.catid=sc1.catid left join UOM as uom on uom.uomid=pm.uom where wm.missing_id!='' and wm.zoneid="+req.zoneid+" "+where+" group by wm.missing_id order by wm.created_at DESC limit " +startlimit +"," +pagelimit +" ";
        }
        var stockkeppinglist = await query(stockkeppinglistquery);

        var totalcountquery = "select * from Missing_Products as wm where wm.missing_id!='' and wm.zoneid="+req.zoneid+" "+where+" order by wm.created_at DESC";
        var total_count = await query(totalcountquery);        
        if(stockkeppinglist.length > 0){
            var getfullcostquery = "select vpid,sum(quantity) as quantity, sum(cost*quantity) as cost from Missing_Products group by vpid";
            var getfullcost = await query(getfullcostquery);

            if(getfullcost.length>0){
                for (let i = 0; i < getfullcost.length; i++) {
                    for (let j = 0; j < stockkeppinglist.length; j++) {
                        if (getfullcost[i].vpid == stockkeppinglist[j].vpid) {
                            stockkeppinglist[j].waste_tillnow = getfullcost[i].quantity;
                            stockkeppinglist[j].cost_tillnow = getfullcost[i].cost;
                        }
                        
                    }
                    
                }
            }

            var totalcount = total_count.length;
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: stockkeppinglist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no stock found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            totalcount: 0,
            message: "check your post values"
        };
        result(null, resobj);
    } 
};

module.exports = StockKeeping;