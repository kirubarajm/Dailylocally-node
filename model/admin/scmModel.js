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
const { parse } = require('path');
var POLog = require('../tableModels/poreceiveunreceivelogTableModel.js');
var MissingQuantity_Report = require('../tableModels/missingquantityreportTableModel.js');
var WasteManagement = require('../tableModels/wastemanagementTableModel.js');
const { tunnel_refund_amout } = require('../constant.js');
var DayOrderComment = require('../admin/orderCommentsModel.js');
var StockLog = require('../tableModels/stocklogTableModel.js');
var converter = require('number-to-words');
var Document = require("../../model/common/documentsModel.js");
var MoveitUserModel = require("../moveit/moveitUserModel.js");
var PushConstant = require("../../push/PushConstant.js");
var Notification = require("../common/notificationModel.js");

var pdf = require("pdf-creator-node");
var fs = require('fs');
// Read HTML Template
var popdfhtml = fs.readFileSync('popdftemplate.html', 'utf8');
var invoicepdfhtml = fs.readFileSync('invoicepdftemplate.html', 'utf8');

var SCM = function(scm) {};

/////////Get Waiting PO List Old///////////
SCM.waiting_po_list_old =async function waiting_po_list_old(req,result) {
    if(req.zone_id){
        var getwaitingpouery = "select pro.prid,cat.catid,cat.name as catagory_name,scl1.scl1_id,scl1.name as subcatL1name,scl2.scl2_id,scl2.name as subcatL2name,pro.vpid,pm.pid,pm.Productname,pm.productdetails,pm.uom as uomid,uom.name as uom_name,pro.quantity,pro.pr_status from Procurement as pro left join Product_live as pl on pl.vpid=pro.vpid left join ProductMaster as pm on pm.pid=pl.pid left join SubcategoryL2 as scl2 on scl2.scl2_id=pm.scl2_id left join SubcategoryL1 as scl1 on scl1.scl1_id=pm.scl1_id left join Category as cat on cat.catid=scl1.catid left join UOM as uom on uom.uomid=pm.uom where pro.pr_status=2 and pro.zoneid="+req.zone_id;
        var getwaitingpo = await query(getwaitingpouery);
        if(getwaitingpo.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getwaitingpo
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

/////////Get Waiting PO List///////////
SCM.waiting_po_list =async function waiting_po_list(req,result) {
    if(req.zoneid){
        var getwaitingpouery = "select pot.tempid,pot.prid,cat.catid,cat.name as catagory_name,scl1.scl1_id,scl1.name as subcatL1name,scl2.scl2_id,scl2.name as subcatL2name,pot.vpid,pl.pid,dop.Productname,dop.product_productdetails,dop.product_uom as uomid,uom.name as uom_name,pot.actual_quantity,pot.requested_quantity,pot.vid,ven.name as vendor_name,vpm.base_price as rate,pot.due_date,vpm.other_charges,pot.buyer_comment,(pot.requested_quantity*(vpm.base_price+vpm.other_charges)) as amount from POtemp as pot left join Dayorder_products as dop on dop.prid=pot.prid left join SubcategoryL2 as scl2 on scl2.scl2_id=dop.product_scl1_id left join SubcategoryL1 as scl1 on scl1.scl1_id=dop.product_scl1_id left join Category as cat on cat.catid=scl1.catid left join UOM as uom on uom.uomid=dop.product_uom left join Vendor_products_mapping as vpm on vpm.vid=pot.vid left join Vendor as ven on ven.vid=pot.vid left join Product_live as pl on pl.vpid=pot.vpid where pot.delete_status=0 and pot.zoneid="+req.zoneid+" group by pot.tempid";

        var getwaitingpo = await query(getwaitingpouery);
        if(getwaitingpo.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getwaitingpo
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

/////////Product Wise Vendor List///////////
SCM.product_wise_vendor_list =async function product_wise_vendor_list(req,result) {
    if(req.zoneid & req.products.length>0){        
        var getvendorquery = "SELECT v.vid,ven.name,v.base_price,v.other_charges,v.expiry_date FROM Vendor_products_mapping as v left join Vendor as ven on ven.vid=v.vid  WHERE v.pid IN ("+req.products+") GROUP BY v.vid HAVING COUNT(DISTINCT v.pid) ="+req.products.length;
        var getvendor = await query(getvendorquery);
        if(getvendor.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getvendor
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

/////////Product Vendor assign Old///////////
SCM.product_vendor_assign_old =async function product_vendor_assign_old(req,result) {
    if(req.zone_id & req.products.length>0){ 
        var result_array = [];
        for (let i = 0; i < req.products.length; i++) {
            var getvendorpricequery = "SELECT vid,pid,base_price,other_charges FROM Vendor_products_mapping  where vid="+req.vid+" and pid="+req.products[i];
            var getvendorprice = await query(getvendorpricequery);
            var due_date  = "0000-00-00";
            var buyer_comment = "";
            if(req.due_date){
                due_date = req.due_date;
            }
            if(req.buyer_comment){
                buyer_comment = req.buyer_comment;
            }

            result_array.push({"vid":getvendorprice[0].vid,"vpid":getvendorprice[0].pid,"base_price":getvendorprice[0].base_price,"other_charges":getvendorprice[0].other_charges,"due_date":due_date,"buyer_comment":buyer_comment});          
        }       
        
        if(result_array.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: result_array
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

/////////Product Vendor assign///////////
SCM.product_vendor_assign =async function product_vendor_assign(req,result) {
    if(req.zoneid && req.tempid.length>0 && req.done_by){                   
        var due_date  = "0000-00-00";
        var buyer_comment = "";
        if(req.due_date){
            due_date = req.due_date;
        }
        if(req.buyer_comment){
            buyer_comment = req.buyer_comment;
        }

        for (let i = 0; i < req.tempid.length; i++) {
            var getpotempquery = "select * from POtemp where tempid in("+req.tempid[i]+")";
            var getpotemp = await query(getpotempquery); 

            if(getpotemp.length>0){
                if(getpotemp[0].requested_quantity > 0){
                    var updatepotempquery = "update POtemp set vid="+req.vid+",due_date='"+due_date+"',buyer_comment='"+buyer_comment+"',vendor_assigned_by='"+req.done_by+"' where tempid in("+req.tempid[i]+")";
                    var updatepotemp = await query(updatepotempquery); 
                }else{
                    var updatepotempquery = "update POtemp set vid="+req.vid+",due_date='"+due_date+"',buyer_comment='"+buyer_comment+"',requested_quantity="+getpotemp[0].actual_quantity+",vendor_assigned_by='"+req.done_by+"' where tempid in("+req.tempid[i]+")";
                    var updatepotemp = await query(updatepotempquery);
                }
            }
        }
        
        let resobj = {
            success: true,
            status: true,
            message: "Vendor Added successfully"
        };
        result(null, resobj);        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post values"
        };
        result(null, resobj);
    }  
};

/////////Update POtemp quantity///////////
SCM.update_potemp_quantity =async function update_potemp_quantity(req,result) {
    if(req.zoneid && req.tempid.length>0){                   
        var due_date  = "0000-00-00";
        var req_quantity = 0;
        var buyer_comment = "";
        if(req.due_date){
            due_date = req.due_date;
        }
        if(req.buyer_comment){
            buyer_comment = req.buyer_comment;
        }
        if(req.requested_quantity){
            req_quantity = req.requested_quantity;
        }
        var updatepotempquery = "update POtemp set requested_quantity="+req_quantity+" where tempid="+req.tempid;
        var updatepotemp = await query(updatepotempquery);        
        if(updatepotemp.affectedRows>0){
            let resobj = {
                success: true,
                status: true,
                message: "quantity updated successfully"
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

/////////Create PO Old///////////
SCM.create_po_old =async function create_po_old(req,result) {
    if(req.zone_id && req.polist){
        var polist = req.polist;
        var uniquevendors = polist.map( (value) => value.vid).filter( (value, index, _req) => _req.indexOf(value) == index);    
        //console.log("Step 1: uniquevendors--->",uniquevendors);
        if (!polist.vid) {
            polist.sort((a, b) => parseFloat(a.vid) - parseFloat(b.vid));
        }
        //console.log("Step 2: sortreq1--->",polist);
        var poids = [];
        for (let i = 0; i < uniquevendors.length; i++) {
            ////Insert PO  and get id///
            var podata = [];
            podata.push({"vid":uniquevendors[i],"zoneid":req.zone_id,"po_status":0});
            // console.log("podata --->",podata);
            PO.createPO(podata,async function(err,pores){
                if(pores.status==true){
                    poids.push(pores.result.insertId);
                    //console.log("inserted pores-->",pores.result.insertId);
                    for (let j = 0; j < polist.length; j++) {
                        var vendorcost = 0;
                        if(polist[j].vid == uniquevendors[i]){
                            var getvendorcostquery = "select * from Vendor_products_mapping where vid="+polist[j].vid+" and pid="+polist[j].vpid;
                            var getvendorcost = await query(getvendorcostquery);
                            //console.log("getvendorcost -->",getvendorcost);
                            var inserpopdata = [];
                            inserpopdata.push({"poid":pores.result.insertId,"prid":polist[j].prid,"vpid":polist[j].vpid,"vid":polist[j].vid,"cost":getvendorcost[0].base_price*polist[j].qty,"other_charges":getvendorcost[0].other_charges*polist[j].qty,"requested_quantity":polist[j].qty,"pop_status":0,"due_date":polist[j].due_date,"buyer_comment":polist[j].buyer_comment});
                            POProducts.createPOProducts(inserpopdata,async function(err,popres){  });
                            vendorcost = vendorcost+((getvendorcost[0].base_price*polist[j].qty)+(getvendorcost[0].other_charges*polist[j].qty));
                            // console.log("vendorcost -->",vendorcost);

                            /////Update Dayorder product status///////
                        }
                        var poupdatedata = [];
                        poupdatedata.push({"poid":pores.result.insertId,"cost":vendorcost});
                        //console.log("poupdatedata-->",poupdatedata);
                        //PO.updatePO(poupdatedata,async function(err,updateedpores){});
                        if(vendorcost > 0 ){
                            var checkquery = "UPDATE PO SET cost="+vendorcost+" WHERE poid ="+pores.result.insertId;
                            // console.log("checkquery -->",checkquery);
                            var check = await query(checkquery);
                        }                    
                        //console.log("check -->",check);
                        //console.log("uniquevendors -->",uniquevendors);
                    }
                }else{

                }            
            });    
            //console.log("poids -->",poids);       
        }
        let resobj = {
            success: true,
            status: true,
            message: "po created successfully"
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post values"
        };
        result(null, resobj);
    }    
};

/////////Create PO///////////
SCM.create_po =async function create_po(req,result) {
    if(req.zoneid && req.templist && req.done_by){
        var polistquery = "select pot.tempid,pot.prid,pot.vpid,pl.pid,pot.vid,pot.requested_quantity as qty,pot.due_date,pot.buyer_comment from POtemp as pot left join Product_live as pl on pl.vpid=pot.vpid where pot.tempid in("+req.templist+") and pot.vpid IS NOT NULL and pot.vid IS NOT NULL and pot.requested_quantity IS NOT NULL and pot.due_date IS NOT NULL and pot.delete_status=0";
        var polist = await query(polistquery);
        if(polist.length>0){
            var uniquevendors = polist.map( (value) => value.vid).filter( (value, index, _req) => _req.indexOf(value) == index);    
            // console.log("Step 1: uniquevendors--->",uniquevendors);
            if (!polist.vid) {
                polist.sort((a, b) => parseFloat(a.vid) - parseFloat(b.vid));
            }
            // console.log("Step 2: sortreq1--->",polist);
            var poids = [];
            for (let i = 0; i < uniquevendors.length; i++) {               
                /////Vendor with total request quantity//////////
                var checkvendorquery = "select sum(requested_quantity) as tot_vendor_qty,vid from POtemp where tempid in("+req.templist+") and vid="+uniquevendors[i];
                var checkvendor = await query(checkvendorquery);
                if(checkvendor.length>0){
                    if(checkvendor[0].tot_vendor_qty>0){
                        //// Insert PO  and get id /// 
                        var podata = [];
                        podata.push({"vid":uniquevendors[i],"zoneid":req.zoneid,"po_status":0,"created_by":req.done_by});
                        PO.createPO(podata[0],async function(err,pores){
                            if(pores.status==true){                            
                                poids.push(pores.result.insertId);
                                //  console.log("Step 3: inserted pores createPO-->",pores.result.insertId);
        
                                var  vendor_polist = polist.filter(item => item.vid == uniquevendors[i]);
                                // console.log("Step 4: filter by vendorid in polist-->",vendor_polist);
                                var vendorcost = 0;
                                for (let j = 0; j < vendor_polist.length; j++) {
                                    if(vendor_polist[j].vid == uniquevendors[i]){
                                        var getvendorcostquery = "select * from Vendor_products_mapping where vid="+vendor_polist[j].vid+" and pid="+vendor_polist[j].pid;
                                        var getvendorcost = await query(getvendorcostquery);
                                          console.log("getvendorcost -->",j,"=>",getvendorcost);
                                        if(getvendorcost.length>0){
                                            var inserpopdata = [];
                                            inserpopdata.push({"poid":pores.result.insertId,"prid":vendor_polist[j].prid,"vpid":vendor_polist[j].vpid,"vid":vendor_polist[j].vid,"cost":getvendorcost[0].base_price*vendor_polist[j].qty,"other_charges":getvendorcost[0].other_charges*vendor_polist[j].qty,"requested_quantity":vendor_polist[j].qty,"pop_status":0,"due_date":vendor_polist[j].due_date,"buyer_comment":vendor_polist[j].buyer_comment});
                                            console.log("inserpopdata -->=>",inserpopdata);
                                            POProducts.createPOProducts(inserpopdata[0],async function(err,popres){
                                                // console.log("Step 5: after popres createPOProducts ==>",popres);
                                                if(popres.status==true){
                                                    //////////// PO Log /////////////////
                                                    polog_data = [];
                                                    polog_data.push({"poid":pores.result.insertId,"popid":popres.result.insertId,"from_type":1,"quantity":vendor_polist[j].qty,"delivery_note":vendor_polist[j].buyer_comment,"zoneid":req.zoneid,"created_by":req.done_by});
                                                    POLog.createPOlog(polog_data[0],async function(err,polog_datares){});


                                                    /////Delete PO Temp///////////
                                                    var updatepotempquery = "update POtemp set delete_status=1 where tempid="+vendor_polist[j].tempid;
                                                    var updatepotemp = await query(updatepotempquery);

                                                    var getstockdataquery = "select * from Stock where vpid="+vendor_polist[j].vpid;
                                                    var getstockdata = await query(getstockdataquery);

                                                    if(getstockdata.length>0){
                                                        //// Update ////
                                                        var updatemapping_qty = parseInt(getstockdata[0].quantity_mapping)+parseInt(vendor_polist[j].qty)
                                                        var updatestockquery = "update Stock set quantity_mapping="+updatemapping_qty+" where vpid="+vendor_polist[j].vpid;
                                                        var updatestock = await query(updatestockquery);
                                                    }else{
                                                        ////Insert /////
                                                        var stockdata = [];
                                                        stockdata.push({"vpid":vendor_polist[j].vpid,"quantity_mapping":vendor_polist[j].qty,"zoneid":req.zoneid});
                                                        Stock.createStock(stockdata,async function(err,stockres){});
                                                    }                                                    
                                                }
                                            });
                                            
                                            vendorcost = parseInt(vendorcost)+(( parseInt(getvendorcost[0].base_price) * parseInt(vendor_polist[j].qty) ) + ( parseInt(getvendorcost[0].other_charges) * parseInt(vendor_polist[j].qty) ));
                                            // console.log("Step 6: sum of vendor cost ==>",vendorcost);
                                        }
                                        /////Update Dayorder product status =>removed///////
                                    }
                                    //////PO PDf Creation /////
                                    console.log("po pdfffffff =-============>");
                                    if(j+1 == vendor_polist.length){
                                        var poid = [];
                                        poid.push({"poid":pores.result.insertId});
                                        SCM.po_pdf(poid[0],async function(err,poidres){
                                            console.log("poidres ==>",poidres);
                                            if(poidres.status==true){
                                                var updatepdfurlquery = "update PO set po_pdf_url='"+poidres.url.filename+"' where poid="+pores.result.insertId;
                                                var updatepdfurl = await query(updatepdfurlquery);
                                            }
                                        });
                                    }
                                }
        
                                if(vendorcost > 0 ){
                                    var checkquery = "UPDATE PO SET cost="+vendorcost+" WHERE poid ="+pores.result.insertId;
                                    // console.log("checkquery -->",checkquery);
                                    var check = await query(checkquery);
                                    // console.log("Step 7: updated po ==>",check);
                                }
                            }else{ console.log("po not created"); }
                        });
                    }else{ 
                        console.log("vendor quantity 0"); 
                        /////Delete PO Temp///////////
                        var updatepotempquery = "update POtemp set delete_status=1 where tempid in("+req.templist+") and vid="+checkvendor[0].vid;
                        var updatepotemp = await query(updatepotempquery);
                    }                    
                }else{ console.log("invalid vendor id"); }                    
            }            
            let resobj = {
                success: true,
                status: true,
                message: "po created successfully"
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: true,
                message: "empty po select list"
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

/////////Get PO List///////////
SCM.get_po_list =async function get_po_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

        var where = "";
        if(req.poid){
            where = where+" and po.poid='"+req.poid+"' ";
        }
        if(req.from_date && req.to_date){
            where = where+" and (date(po.created_at) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }
        if(req.pop_status){
            where = where+" and pop.pop_status="+req.pop_status;
        }
        if(req.vendorsearch){
            where = where+" and po.vid='"+req.vendorsearch+"' or ven.name='"+req.vendorsearch+"' ";
        }
        if(req.due_date){
            where = where+" and date(pop.due_date)='"+req.due_date+"' ";
        }
        if(req.delivery_note){
            where = where+" and pop.delivery_note='"+req.delivery_note+"' ";
        }
        if(req.po_status){
            where = where+" and po.po_status="+req.po_status;
        }        
        if(req.report && req.report==1){
            var getpolistquery = "select po.poid,po.po_pdf_url, CONCAT('"+domainname+":"+port+"/uploads/po_pdf/',po.poid,'.pdf') as po_pdf,po.vid,ven.name,po.created_at,if(sum(pop.requested_quantity),sum(pop.requested_quantity),0) as total_quantity,if(sum(pop.requested_quantity-pop.received_quantity),sum(pop.requested_quantity-pop.received_quantity),0) as open_quqntity, if(sum(pop.received_quantity),sum(pop.received_quantity),0) as received_quantity,po.cost,pop.due_date,po.po_status,if(sum(pop.received_quantity>0),0,1) as delete_flag,if(sum(pop.received_quantity>0),1,0) as close_flag from PO as po left join POproducts as pop on pop.poid=po.poid left join Vendor as ven on ven.vid=po.vid where po.zoneid="+req.zoneid+" "+where+" group by po.poid order by po.poid desc";
        }else{
            var getpolistquery = "select po.poid,po.po_pdf_url, CONCAT('"+domainname+":"+port+"/uploads/po_pdf/',po.poid,'.pdf') as po_pdf,po.vid,ven.name,po.created_at,if(sum(pop.requested_quantity),sum(pop.requested_quantity),0) as total_quantity,if(sum(pop.requested_quantity-pop.received_quantity),sum(pop.requested_quantity-pop.received_quantity),0) as open_quqntity, if(sum(pop.received_quantity),sum(pop.received_quantity),0) as received_quantity,po.cost,pop.due_date,po.po_status,if(sum(pop.received_quantity>0),0,1) as delete_flag,if(sum(pop.received_quantity>0),1,0) as close_flag from PO as po left join POproducts as pop on pop.poid=po.poid left join Vendor as ven on ven.vid=po.vid where po.zoneid="+req.zoneid+" "+where+" group by po.poid order by po.poid desc limit " +startlimit +"," +pagelimit +"";
        }
        var getpolist = await query(getpolistquery);

        var totalcountquery = "select po.poid,po.po_pdf_url, CONCAT('"+domainname+":"+port+"/uploads/po_pdf/',po.poid,'.pdf') as po_pdf,po.vid,ven.name,po.created_at,if(sum(pop.requested_quantity),sum(pop.requested_quantity),0) as total_quantity,if(sum(pop.requested_quantity-pop.received_quantity),sum(pop.requested_quantity-pop.received_quantity),0) as open_quqntity, if(sum(pop.received_quantity),sum(pop.received_quantity),0) as received_quantity,po.cost,pop.due_date,po.po_status,if(sum(pop.received_quantity>0),0,1) as delete_flag,if(sum(pop.received_quantity>0),1,0) as close_flag from PO as po left join POproducts as pop on pop.poid=po.poid left join Vendor as ven on ven.vid=po.vid where po.zoneid="+req.zoneid+" "+where+" group by po.poid order by po.poid desc";
        var total_count = await query(totalcountquery);

        if(getpolist.length > 0){
            for (let i = 0; i < getpolist.length; i++) {
                if(getpolist[i].open_quqntity < 0){
                    getpolist[i].open_quqntity=0;
                }                
            }
            var totalcount = total_count.length;
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: getpolist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no records found"
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

/////////Get PO receive List///////////
SCM.get_po_receive_list =async function get_po_receive_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

        var where = "";
        if(req.from_date && req.to_date){
            where = where+" and (date(po.created_at) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }
        if(req.productsearch){
            where = where+" and pop.vpid='"+req.productsearch+"' or dop.productname='"+req.productsearch+"' ";
        }
        if(req.vendorsearch){
            where = where+" and po.vid='"+req.vendorsearch+"' or ven.name='"+req.vendorsearch+"' ";
        }
        if(req.poid){
            where = where+" and po.poid="+req.poid;
        }

        if(req.report && req.report==1){
            var getpolistquery = "select pop.popid,po.poid,pop.vpid,dop.productname,dop.product_short_desc,uom.name as uom,po.vid,ven.name,po.created_at,if(st.quantity,st.quantity,0) as boh,if(sum(pop.requested_quantity), sum(pop.requested_quantity),0) as total_quantity,if(sum(pop.requested_quantity-pop.received_quantity),sum(pop.requested_quantity-pop.received_quantity),0) as open_quqntity, if(sum(pop.received_quantity), sum(pop.received_quantity),0) as received_quantity,po.cost,po.po_status,pop.pop_status,pop.sorting_status,pop.stand_by from POproducts as pop left join PO as po on po.poid = pop.poid left join Vendor as ven on ven.vid=po.vid left join Dayorder_products as dop on dop.prid=pop.prid left join UOM as uom on uom.uomid=dop.product_uom left join Stock as st on st.vpid=pop.vpid where po.zoneid="+req.zoneid+" and po.po_status IN(0,1) "+where+" group by pop.popid";
        }else{
            var getpolistquery = "select pop.popid,po.poid,pop.vpid,dop.productname,dop.product_short_desc,uom.name as uom,po.vid,ven.name,po.created_at,if(st.quantity,st.quantity,0) as boh,if(sum(pop.requested_quantity), sum(pop.requested_quantity),0) as total_quantity,if(sum(pop.requested_quantity-pop.received_quantity),sum(pop.requested_quantity-pop.received_quantity),0) as open_quqntity, if(sum(pop.received_quantity), sum(pop.received_quantity),0) as received_quantity,po.cost,po.po_status,pop.pop_status,pop.sorting_status,pop.stand_by from POproducts as pop left join PO as po on po.poid = pop.poid left join Vendor as ven on ven.vid=po.vid left join Dayorder_products as dop on dop.prid=pop.prid left join UOM as uom on uom.uomid=dop.product_uom left join Stock as st on st.vpid=pop.vpid where po.zoneid="+req.zoneid+" and po.po_status IN(0,1) "+where+" group by pop.popid order by pop.popid limit " +startlimit +"," +pagelimit +" ";
        }
        var getpolist = await query(getpolistquery);
        //  console.log("getpolistquery ==>",getpolistquery);

        var totalcountquery = "select pop.popid,po.poid,pop.vpid,dop.productname,dop.product_short_desc,uom.name as uom,po.vid,ven.name,po.created_at,if(st.quantity,st.quantity,0) as boh,if(sum(pop.requested_quantity), sum(pop.requested_quantity),0) as total_quantity,if(sum(pop.requested_quantity-pop.received_quantity),sum(pop.requested_quantity-pop.received_quantity),0) as open_quqntity, if(sum(pop.received_quantity), sum(pop.received_quantity),0) as received_quantity,po.cost,po.po_status,pop.pop_status,pop.sorting_status,pop.stand_by from POproducts as pop left join PO as po on po.poid = pop.poid left join Vendor as ven on ven.vid=po.vid left join Dayorder_products as dop on dop.prid=pop.prid left join UOM as uom on uom.uomid=dop.product_uom left join Stock as st on st.vpid=pop.vpid where po.zoneid="+req.zoneid+" and po.po_status IN(0,1) "+where+" group by pop.popid";
        var total_count = await query(totalcountquery);
        
        if(getpolist.length > 0){
            var totalcount = total_count.length; 
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: getpolist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no records found"
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

/////////Update PO receive///////////
SCM.update_po_receive =async function update_po_receive(req,result) {
    if(req.zoneid && req.done_by && req.popid && req.vpid && req.quantity){   
        var dn = "";
        if(req.delivery_note){
            dn = req.delivery_note;
        }

        var getpopquery = "select poid,popid,vpid,requested_quantity,(received_quantity+aditional_quantity) as total_received_quantity,stand_by from POproducts where popid="+req.popid;
        var getpop = await query(getpopquery);
        if(getpop.length>0){
            var checkqty = parseInt(getpop[0].total_received_quantity)+parseInt(req.quantity);
            if(checkqty > getpop[0].requested_quantity){
                var receive_qty = getpop[0].requested_quantity;
                var aditional_qty = parseInt(checkqty)-parseInt(getpop[0].requested_quantity);
            }else{
                var receive_qty = req.quantity;
                var aditional_qty = 0;
            } 

            var sorting_status = 0;
            var checksorting = ((parseInt(receive_qty)+parseInt(aditional_qty))+parseInt(req.quantity));
            if(getpop[0].requested_quantity <= checksorting){
                sorting_status = 1;
            }
            
            // var updatepopquery  = "update POproducts set pop_status=1, delivery_note='"+dn+"', received_quantity="+receive_qty+", aditional_quantity="+aditional_qty+", sorting_status="+sorting_status+", stand_by="+req.quantity+" where popid="+req.popid;

            //var updatepopquery  = "update POproducts set pop_status=1, delivery_note='"+dn+"', received_quantity="+receive_qty+", aditional_quantity="+aditional_qty+", stand_by="+req.quantity+" where popid="+req.popid;
            var updatecount = parseInt(getpop[0].stand_by)+parseInt(req.quantity);
            var updatepopquery  = "update POproducts set delivery_note='"+dn+"', stand_by="+updatecount+" where popid="+req.popid;

            var updatepop = await query(updatepopquery);          
            if(updatepop.affectedRows>0){
                polog_data = [];
                polog_data.push({"poid":getpop[0].poid,"popid":getpop[0].popid,"from_type":2,"quantity":req.quantity,"delivery_note":dn,"zoneid":req.zoneid,"created_by":req.done_by});
                POLog.createPOlog(polog_data[0],async function(err,polog_datares){});
                
                // var checkpostatusquery = "select count(popid) as popcount,count(case when pop_status=1 then popid end) as reccount from POproducts where poid="+getpop[0].poid;
                // var checkpostatus = await query(checkpostatusquery);
                // if(checkpostatus.length>0){
                //     if(checkpostatus[0].popcount == checkpostatus[0].reccount){
                //         var updatepostatusquery = "update PO set po_status=1 where poid="+getpop[0].poid;
                //         var updatepostatus = await query(updatepostatusquery);
                //     }
                // }

                let resobj = {
                    success: true,
                    status: true,
                    message: "received succesfully"
                };
                result(null, resobj);

                // var checkpidquery = "select * from Stock where vpid="+req.vpid+" and zoneid="+req.zone_id;
                // var checkpid = await query(checkpidquery);
                // // console.log("checkpid ==>",checkpid);
                // if(checkpid.length>0){
                //     //Update/////
                //     var totalqty = checkpid[0].quantity+req.quantity;
                //     var updatestockquery  = "update Stock set quantity="+totalqty+" where vpid="+req.vpid+" and zoneid="+req.zone_id;
                //     var updatestock = await query(updatestockquery);  
                //     if(updatestock.affectedRows>0){
                //         // SCM.auto_stock_to_dayorder(req);
                //         let resobj = {
                //             success: true,
                //             status: true,
                //             message: "updated succesfully"
                //         };
                //         result(null, resobj);
                //     }else{
                //         let resobj = {
                //             success: true,
                //             status: false,
                //             message: "something went wrong plz try again1"
                //         };
                //         result(null, resobj);
                //     }
                // }else{
                //     //Insert/////
                //     var stockdata = [];
                //     stockdata.push({"vpid":req.vpid,"quantity":req.quantity,"zoneid":req.zoneid});
                //     Stock.createStock(stockdata,async function(err,stockres){
                //         if(stockres.status==true){
                //             // SCM.auto_stock_to_dayorder(req);
                //             let resobj = {
                //                 success: true,
                //                 status: true,
                //                 message: "updated succesfully"
                //             };
                //             result(null, resobj);
                //         }else{
                //             let resobj = {
                //                 success: true,
                //                 status: false,
                //                 message: "something went wrong plz try again2"
                //             };
                //             result(null, resobj);
                //         }
                //     });
                // }                    
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "something went wrong plz try again3"
                };
                result(null, resobj);
            }
            
        }else{
            ////Invalid popid/////
            let resobj = {
                success: true,
                status: false,
                message: "Invalid popid"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }     
};

/////////Update PO unreceive only for Stand by quantity///////////
SCM.update_po_unreceive =async function update_po_unreceive(req,result) {
    if(req.zoneid && req.done_by && req.popid && req.quantity){
        var dn = "";
        if(req.delivery_note){
            dn = req.delivery_note;
        }

        var getpopquery = "select poid,popid,vpid,stand_by from POproducts where popid="+req.popid;
        var getpop = await query(getpopquery);
        if(getpop.length>0){
            // console.log("getpop[0].stand_by==>",getpop);
            if(getpop[0].stand_by>0){
                if(req.quantity <= getpop[0].stand_by){
                    var standby_qty = parseInt(getpop[0].stand_by)-parseInt(req.quantity);
                    if(standby_qty>=0){
                        var updatepopquery = "update POproducts set stand_by="+standby_qty+" where popid="+req.popid;
                        var updatepopquery = await query(updatepopquery);                    
                        if(updatepopquery.affectedRows>0){
                            polog_data = [];
                            polog_data.push({"poid":getpop[0].poid,"popid":getpop[0].popid,"from_type":3,"quantity":req.quantity,"delivery_note":dn,"zoneid":req.zoneid,"created_by":req.done_by});
                            POLog.createPOlog(polog_data[0],async function(err,polog_datares){
                                if(polog_datares.status == true){
                                    let resobj = {
                                        success: true,
                                        status: true,
                                        message: "un received successfully"
                                    };
                                    result(null, resobj);
                                }else{
                                    let resobj = {
                                        success: true,
                                        status: false,
                                        message: "something went wrong in create un receive log try again"
                                    };
                                    result(null, resobj);
                                }
                            });
                        }else{
                            let resobj = {
                                success: true,
                                status: false,
                                message: "something went wrong in update po product try again"
                            };
                            result(null, resobj); 
                        }
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "invalid quantity"
                        };
                        result(null, resobj); 
                    }                    
                }else{
                    let resobj = {
                        success: true,
                        status: true,
                        message: "requested quantity greaterthen stand by quantity"
                    };
                    result(null, resobj);
                }
            }else{
                let resobj = {
                    success: true,
                    status: true,
                    message: "sorry empty stand by quantity"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "Invalid popid"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }     
};

/////////Update PO unreceive OLD stock level///////////
SCM.update_po_unreceive_old =async function update_po_unreceive_old(req,result) {
    if(req.zone_id && req.popid && req.quantity){
        var dn = "";
        if(req.delivery_note){
            dn = req.delivery_note;
        }

        var getpopquery = "select poid,popid,vpid,stand_by,requested_quantity,(received_quantity+aditional_quantity) as total_received_quantity,sorting_status from POproducts where popid="+req.popid;
        var getpop = await query(getpopquery);
        console.log("getpop===>",getpop);
        if(getpop.length>0){
            if(req.quantity <= getpop[0].total_received_quantity){
                // if(getpop[0].sorting_status==0){
                    var getstockquery = "select * from Stock where vpid="+getpop[0].vpid;
                    var getstock = await query(getstockquery);
                    if(getstock.length>0){
                        if(req.quantity <= getstock[0].quantity){
                            // var qty = parseInt(getstock[0].quantity) - parseInt(getpop[0].total_received_quantity);
                            var updatestockquery = "update Stock set quantity="+req.quantity+" where vpid="+getpop[0].vpid;
                            var updatestock = await query(updatestockquery);
                            if(updatestock.affectedRows>0){
                                // var updatepopquery = "update POproducts set pop_status=0,received_quantity=0,aditional_quantity=0 where popid="+req.popid;
                                var updateqty = parseInt(getpop[0].total_received_quantity) - parseInt(req.quantity);
                                var receivedqty = 0;
                                var aditionalqty = 0;
                                if(getpop[0].requested_quantity < updateqty){
                                    receivedqty = getpop[0].requested_quantity;
                                    aditionalqty = parseInt(updateqty) - parseInt(getpop[0].requested_quantity);
                                }else{
                                    receivedqty = updateqty;
                                    aditionalqty = 0;
                                }

                                var stand_by = 0;
                                if(getpop[0].stand_by < req.quantity){
                                    stand_by = 0;
                                }else{
                                    stand_by = parseInt(getpop[0].stand_by)-(req.quantity);
                                }

                                var updatepopquery = "update POproducts set received_quantity="+receivedqty+",aditional_quantity="+aditionalqty+",stand_by="+stand_by+" where popid="+req.popid;
                                var updatepopquery = await query(updatepopquery);
                                
                                if(updatepopquery.affectedRows>0){
                                    polog_data = [];
                                    polog_data.push({"poid":getpop[0].poid,"popid":getpop[0].popid,"type":2,"quantity":req.quantity,"delivery_note":dn,"zoneid":req.zone_id});
                                    POLog.createPOlog(polog_data,async function(err,polog_datares){});
                                }                                
                            }
                            if(updatestock.affectedRows>0 && updatepopquery.affectedRows>0){
                                let resobj = {
                                    success: true,
                                    status: true,
                                    message: "un received successfully"
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
                        }else{
                            let resobj = {
                                success: true,
                                status: false,
                                message: "sorry your quantity does not equal to stock quantity:"+getstock[0].quantity
                            };
                            result(null, resobj);
                        }                        
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "no stock"
                        };
                        result(null, resobj);
                    }
                // }else{
                //     let resobj = {
                //         success: true,
                //         status: false,
                //         message: "pop already moved to sorting"
                //     };
                //     result(null, resobj);
                // }
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "invalid quantity"
                };
                result(null, resobj);
            }                       
        }else{
            ////Invalid popid/////
            let resobj = {
                success: true,
                status: false,
                message: "Invalid popid"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }     
};

/////////Update PO unreceive  stock level///////////
SCM.update_po_unreceive_from_sorting =async function update_po_unreceive_from_sorting(req,result) {
    if(req.zoneid && req.dopid && req.vpid && req.report_quantity && req.from_type){
        var dn = "";
        if(req.from_type==1){
            dn = "unreceive from Sorting";
        }else if(req.from_type==2){
            dn = "unreceive from QA";
        }else{
            dn = "";
        }

        var getdopquery = "select * from Dayorder_products where id="+req.dopid+" and vpid="+req.vpid;
        var getdop = await query(getdopquery);
        if(getdop.length>0){
            if(getdop[0].received_quantity>0){
                if(getdop[0].popid != ''){
                    var getpopquery = "select *,(received_quantity+aditional_quantity) as totalreceivedqty from POproducts where popid="+getdop[0].popid;
                    var getpop = await query(getpopquery);
                    if(getpop.length>0){
                        if(req.report_quantity <= getdop[0].received_quantity){
                            if(req.report_quantity <= getpop[0].totalreceivedqty){
                                var reduced_qty = parseInt( getdop[0].received_quantity)-parseInt(req.report_quantity);
                                var updatedopquery = "update Dayorder_products set received_quantity="+reduced_qty+",scm_status=2 where id="+req.dopid+" and vpid="+req.vpid;
                                var updatedop = await query(updatedopquery);
                                if(updatedop.affectedRows>0){
                                    /////add reduced_qty in stock///
                                    var getstockquery = "select * from Stock where vpid="+req.vpid;
                                    var getstock = await query(getstockquery);

                                    if(getstock.length>0){
                                        ////////Stock in Log//////////////
                                        var stocklogdataout = [];
                                        stocklogdataout.push({"stockid":getstock[0].stockid,"vpid":getstock[0].vpid,"dopid":req.dopid,"type":1,"from_type":req.from_type+1,"quantity":req.report_quantity,"zoneid":req.zoneid});
                                        StockLog.createStockLog(stocklogdataout[0], async function(err,stocklogdatares){ });
                                    }                                    

                                    /////reduce quantity in pop////
                                    var popstock_qty = parseInt(getpop[0].totalreceivedqty)-parseInt(req.report_quantity);
                                    var addition_qty = 0;
                                    var received_qty = 0;
    
                                    if(popstock_qty > getpop[0].requested_quantity){
                                        addition_qty = parseInt(popstock_qty)-parseInt(getpop[0].requested_quantity);
                                        received_qty = getpop[0].requested_quantity;
                                    }else{
                                        addition_qty = 0;
                                        received_qty = popstock_qty;
                                    }
    
                                    var updatepopquery = "update POproducts set received_quantity="+received_qty+",aditional_quantity="+addition_qty+" where popid="+getdop[0].popid;
                                    var updatepop = await query(updatepopquery);
                                    if(updatepop.affectedRows>0){
                                        if(getstock.length>0){
                                            ////////Stock out Log//////////////
                                            var stocklogdataout = [];
                                            stocklogdataout.push({"stockid":getstock[0].stockid,"vpid":getstock[0].vpid,"popid":getdop[0].popid,"type":2,"from_type":req.from_type+1,"quantity":req.report_quantity,"zoneid":req.zoneid,"dopid":req.dopid});
                                            StockLog.createStockLog(stocklogdataout[0], async function(err,stocklogdatares){ });
                                        }
                                        polog_data = [];
                                        polog_data.push({"poid":getpop[0].poid,"popid":getpop[0].popid,"from_type":3,"quantity":req.report_quantity,"delivery_note":dn,"zoneid":req.zoneid});
                                        POLog.createPOlog(polog_data[0],async function(err,polog_datares){
                                            if(polog_datares.status == true){
                                                let resobj = {
                                                    success: true,
                                                    status: true,
                                                    message: "un received successfully"
                                                };
                                                result(null, resobj);
                                            }else{
                                                let resobj = {
                                                    success: true,
                                                    status: false,
                                                    message: "something went wrong in create un receive log try again"
                                                };
                                                result(null, resobj);
                                            }
                                        });
                                    }else{
                                        let resobj = {
                                            success: true,
                                            status: false,
                                            message: "something went wrong in pop update try again"
                                        };
                                        result(null, resobj);
                                    }
                                }else{
                                    let resobj = {
                                        success: true,
                                        status: false,
                                        message: "something went wrong in dop update try again"
                                    };
                                    result(null, resobj);
                                }
                            }else{
                                let resobj = {
                                    success: true,
                                    status: false,
                                    message: "invalid pop quantity"
                                };
                                result(null, resobj);
                            }                        
                        }else{
                            let resobj = {
                                success: true,
                                status: false,
                                message: "quantity mis match in po"
                            };
                            result(null, resobj);
                        }
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "invalid pop id"
                        };
                        result(null, resobj);
                    }                
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "invalid pop id"
                    };
                    result(null, resobj);
                }
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "received qtanty already 0"
                };
                result(null, resobj);
            }            
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "invalid dop id"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }   
};

/////////View PO/////////////
SCM.view_po =async function view_po(req,result) {
    if(req.zoneid && req.poid){   
        var poviewquery = "select po.*,ven.name as vendorname,JSON_ARRAYAGG(JSON_OBJECT('popid',pop.popid,'poid',pop.poid,'prid',pop.prid,'vpid',pop.vpid,'productname',dop.productname,'vid',pop.vid,'vendorname',ven.name,'cost',pop.cost,'other_charges',pop.other_charges,'requested_quantity',pop.requested_quantity,'received_quantity',pop.received_quantity,'aditional_quantity',pop.aditional_quantity,'pop_status',pop.pop_status,'stand_by',pop.stand_by,'due_date',pop.due_date,'buyer_comment',pop.buyer_comment,'delivery_note',pop.delivery_note,'sorting_status',pop.sorting_status,'created_at',pop.created_at,'updated_at',pop.updated_at)) as products from PO as po left join POproducts as pop on pop.poid=po.poid left join Procurement as pr on pr.prid=pop.prid left join Dayorder_products as dop on dop.prid=pr.prid left join Vendor as ven on ven.vid=po.vid where po.poid="+req.poid;
        var poview = await query(poviewquery);
        if(poview.length>0){
            for (let i = 0; i < poview.length; i++) {
                poview[i].products = JSON.parse(poview[i].products);                
            }
            let resobj = {
                success: true,
                status: true,
                result: poview
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
            message: "fill all required fields"
        };
        result(null, resobj);
    }     
};

/////// PO PDF ////////
SCM.po_pdf= async function po_pdf(req,result) {
    if(req.poid){
        var getchecklistquery ="select po.poid,po.created_at as podate,pop.due_date as deliveryduedate,ven.name as vendorname,ven.address as vendoraddress,ven.phoneno as vendorphoneno,ven.email as vendoremail,ven.gst as vendorgst,JSON_ARRAYAGG(JSON_OBJECT('popid',pop.popid,'poid',pop.poid,'product_name',dop.productname,'rate',pop.cost,'quantity',pop.requested_quantity,'unit',CONCAT(dop.product_packetsize,'-',uom.name),'amount',pop.requested_quantity*pop.cost)) as items from PO as po left join POproducts as pop on pop.poid=po.poid left join Procurement as pr on pr.prid=pop.prid left join Dayorder_products as dop on dop.prid=pr.prid left join Vendor as ven on ven.vid=po.vid left join UOM as uom on uom.uomid=dop.product_uom where po.poid="+req.poid;
        var getchecklist = await query(getchecklistquery);
        
        for (let i = 0; i < getchecklist.length; i++) {
            getchecklist[i].items = JSON.parse(getchecklist[i].items); 
        }
    
        var sumof = 0;
        for (let j = 0; j < getchecklist[0].items.length; j++) {
            sumof = parseInt(sumof)+parseInt(getchecklist[0].items[j].amount);
        }       
        var sumofvalue = converter.toWords(sumof);
    
        if(getchecklist.length != 0){
            var options = {
                format: "A4",
                orientation: "landscap",
                border: "10mm"
            };
            var order = [{
                poid: getchecklist[0]['poid'],
                podate: moment(getchecklist[0]['podate']).format("DD-MM-YYYY"),
                deliveryduedate: moment(getchecklist[0]['deliveryduedate']).format("DD-MM-YYYY"),
                vendorname: getchecklist[0]['vendorname'],
                vendoraddress: getchecklist[0]['vendoraddress'],
                vendorphoneno: getchecklist[0]['vendorphoneno'],
                vendoremail: getchecklist[0]['vendoremail'],
                vendorgst: getchecklist[0]['vendorgst'],
                sumof: sumof,
                sumofvalue: sumofvalue
            }]
            var headerdata = [{
                headerlogo: constant.tovo_po_header_logo,
                headername: constant.tovo_po_header_name,
                headeraddress: constant.tovo_po_header_address,
                headerarea: constant.tovo_po_header_area,
                headergst: constant.tovo_po_header_gst,
            }]
            var footerdata = [{
                shipto: constant.tovo_po_ship_to,
                contactname: constant.tovo_po_contact,
                contactnumber: constant.tovo_po_contact_number,
                contactemail: constant.tovo_po_contact_email,
                footername: constant.tovo_po_footer_name,
                footeraddress: constant.tovo_po_footer_address,
                footerarea: constant.tovo_po_footer_area,
                footersign: constant.tovo_po_authorized_sign,
            }]
            var items = getchecklist[0]['items'];
                // console.log("items ===>",items);
            var pathfilename = "./uploads/po_pdf/"+getchecklist[0]['poid']+".pdf";
            var document = {
                html: popdfhtml,
                data: {
                    items: items,
                    order: order,
                    footer: footerdata,
                    header:headerdata,
                },
                path: pathfilename
            };
            //console.log(document);
            pdf.create(document, options)
                .then(res => {
                    console.log(res.filename);
                    ///////

                    // Document.newmoveitdocumentupload(res.filename);


                    let resobj = {
                    success: true,
                    message: "pdf Created Successfully",
                    status:true,
                    url: res
                    };
                    result(null, resobj);
                })
                .catch(error => {
                    console.error(error)
                    let resobj = {
                    success: false,
                    message: "something went wrong",
                    status:false
                    };
                    result(null, resobj);
                });    
        }else{
          let resobj = {
            success: false,
            message: "no record in this order",
            status:false
          };
          result(null, resobj);
        } 
    }else{
        let resobj = {
            success: false,
            message: "check post values",
            status:false
          };
          result(null, resobj);
    }    
};

/////// Invoice PDF ////////
SCM.invoice_pdf= async function invoice_pdf(req,result) {
    if(req.doid){
        var getchecklistquery ="select dayo.id,dayo.invoice_no,dayo.date,dayo.userid,us.name,us.phoneno,dayo.google_address,dayo.delivery_charge,count(dop.vpid) as u_product_count,JSON_ARRAYAGG(JSON_OBJECT('product_name',dop.productname,'hsn',dop.product_hsn_code,'unit_price',dop.price,'quantity',dop.quantity,'price',(dop.price*dop.quantity))) AS items from Dayorder as dayo left join Dayorder_products as dop on dop.doid=dayo.id left join User as us on us.userid=dayo.userid where  dayo.id="+req.doid+" group by dop.doid";
        var getchecklist = await query(getchecklistquery);
        
        for (let i = 0; i < getchecklist.length; i++) {
            getchecklist[i].items = JSON.parse(getchecklist[i].items); 
        }
        
        var sumof = 0;
        for (let j = 0; j < getchecklist[0].items.length; j++) {
            if(getchecklist[0].items[j].price>0){}else{ getchecklist[0].items[j].price = 0; }
            sumof = parseInt(sumof)+parseInt(getchecklist[0].items[j].price);
        }       

        if(getchecklist[0].delivery_charge){
            getchecklist[0].delivery_charge=getchecklist[0].delivery_charge;
        }else{
            getchecklist[0].delivery_charge=0;
        }
        var finalamount = 0;
        finalamount = parseInt(sumof)+parseInt(getchecklist[0].delivery_charge);
        var finalamountvalue = converter.toWords(finalamount);

        var gst = 0;
        if(getchecklist[0].delivery_charge>0){
            gst = (parseInt(getchecklist[0].delivery_charge)*9)/100;
        }
        if(gst>0){
            getchecklist[0].delivery_charge= parseFloat(getchecklist[0].delivery_charge)-(parseFloat(gst*2));
        }
        if(getchecklist.length != 0){
            var options = {
                format: "A4",
                orientation: "landscap",
                border: "10mm"
            };
            var order = [{
                invoiceno: getchecklist[0]['invoice_no'],
                doid: getchecklist[0]['id'],
                date: moment(getchecklist[0]['date']).format("DD-MM-YYYY"),
                itemcount:getchecklist[0]['u_product_count'],
                customername: getchecklist[0]['name'],
                customeraddress: getchecklist[0]['google_address'],
                customerphoneno: getchecklist[0]['phoneno'],
                deliverycharge: getchecklist[0].delivery_charge,
                sumof: sumof,
                finalamount: finalamount,
                finalamountvalue: finalamountvalue,
                discount:0,
                CGST: gst,
                SGST: gst,
            }]
            var headerdata = [{
                headername: constant.tovo_po_header_name,
                headeraddress: constant.tovo_po_header_address,
                headerarea: constant.tovo_po_header_area,
                headergst: constant.tovo_po_header_gst,
            }]
            var footerdata = [{
                shipto: constant.tovo_po_ship_to,
                contactname: constant.tovo_po_contact,
                contactnumber: constant.tovo_po_contact_number,
                contactemail: constant.tovo_po_contact_email,
                footername: constant.tovo_po_footer_name,
                footeraddress: constant.tovo_po_footer_address,
                footerarea: constant.tovo_po_footer_area,
                footersign: constant.tovo_po_authorized_sign,
            }]
            var items = getchecklist[0]['items'];
                //  console.log("items ===>",items);
            var pathfilename = "./uploads/invoice_pdf/"+getchecklist[0]['id']+".pdf";
            var document = {
                html: invoicepdfhtml,
                data: {
                    items: items,
                    order: order,
                    footer: footerdata,
                    header:headerdata,
                },
                path: pathfilename
            };
            //console.log(document);
            pdf.create(document, options)
                .then(res => {
                    console.log(res.filename);
                    ///////

                    // Document.newmoveitdocumentupload(res.filename);


                    let resobj = {
                    success: true,
                    message: "pdf Created Successfully",
                    status:true,
                    url: res
                    };
                    result(null, resobj);
                })
                .catch(error => {
                    console.error(error)
                    let resobj = {
                    success: false,
                    message: "something went wrong",
                    status:false
                    };
                    result(null, resobj);
                });    
        }else{
          let resobj = {
            success: false,
            message: "no record in this order",
            status:false
          };
          result(null, resobj);
        } 
    }else{
        let resobj = {
            success: false,
            message: "check post values",
            status:false
          };
          result(null, resobj);
    }    
};

/////////Delete PO///////////
SCM.delete_po =async function delete_po(req,result) {
    if(req.zoneid && req.poid && req.done_by){  
        // var getpoquery = "select * from PO where zoneid="+req.zoneid+" and poid="+req.poid;
        var getpoquery = "select po.*,if(sum(pop.received_quantity>0),0,1) as delete_flag,if(sum(pop.received_quantity>0),1,0) as close_flag from PO as po left join POproducts as pop on pop.poid=po.poid where po.zoneid="+req.zoneid+" and po.poid="+req.poid+" group by po.poid order by po.poid desc";
        var getpo = await query(getpoquery);

        var getpopbeforequery = "select * from POproducts where poid=+"+req.poid;
        var getpopbefore = await query(getpopbeforequery);
        if(getpo.length>0){
            let resobj = { };
            //console.log("getpo[0].po_status==>",getpo[0].po_status);
            switch (getpo[0].po_status) {
                case 0:
                    if(getpo[0].delete_flag==1){
                        //////Update PO///////////////
                        var getpopquery = "select count(pop.popid) as total_count,count(case when pop.pop_status=0 then pop.popid end) as open_count from PO as po left join POproducts as pop on pop.poid=po.poid where po.zoneid="+req.zoneid+" and pop.poid="+req.poid;
                        var getpop = await query(getpopquery);
                        if(getpop.length>0){
                            if(getpop[0].total_count == getpop[0].open_count){
                                var updatepoquery = "update PO set po_status=4 where zoneid="+req.zoneid+" and poid="+req.poid;
                                var updatepo = await query(updatepoquery);

                                var updatepoquery = "update POproducts set pop_status=4 where poid="+req.poid;
                                var updatepo = await query(updatepoquery);
                                if(updatepo.affectedRows>0){
                                    for (let i = 0; i < getpopbefore.length; i++) {
                                        var updateproquery = "update Procurement set pr_status=1 where prid="+getpopbefore[i].prid;
                                        var updatepro = await query(updateproquery);
                                    }
                                    polog_data = [];
                                    polog_data.push({"poid":req.poid,"from_type":5,"zoneid":req.zoneid,"created_by":req.done_by});
                                    POLog.createPOlog(polog_data[0],async function(err,polog_datares){  }); 
                                    resobj = {
                                        success: true,
                                        status: true,
                                        message: "po deleted successfully"
                                    };
                                    result(null, resobj);
                                }else{
                                    resobj = {
                                        success: true,
                                        status: false,
                                        message: "something went wrong plz try again"
                                    };
                                    result(null, resobj);
                                }
                            }else{
                                resobj = {
                                    success: true,
                                    status: false,
                                    message: "some poproducts status not match"
                                };
                                result(null, resobj);
                            }
                        }else{
                            resobj = {
                                success: true,
                                status: false,
                                message: "no data"
                            };
                            result(null, resobj);
                        }
                    }else{
                        resobj = {
                            success: true,
                            status: false,
                            message: "Already Received"
                        };
                        result(null, resobj);
                    }                   
                    break;
                case 1:
                    /////Already Received//////
                    resobj = {
                        success: true,
                        status: false,
                        message: "Already Received"
                    };
                    result(null, resobj);
                    break;
                case 2:
                    /////Already UN-Received//////  
                    resobj = {
                        success: true,
                        status: false,
                        message: "Already UN-Received"
                    };
                    result(null, resobj);                                                                                      
                    break;
                case 3:
                    /////Already Close////// 
                    console.log("3");
                    resobj = {
                        success: true,
                        status: false,
                        message: "Already Close"
                    };
                    result(null, resobj);
                    break;
                case 4:
                    /////Already Delete//////
                    resobj = {
                        success: true,
                        status: false,
                        message: "Already Delete"
                    };
                    result(null, resobj);
                    break;            
                default:
                    ////Default//////////
                    resobj = {
                        success: true,
                        status: false,
                        message: "no action performed"
                    };
                    result(null, resobj);
                    break;
            }  
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "in valid po id"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }     
};

/////////Close PO///////////
SCM.close_po =async function close_po(req,result) {
    if(req.zoneid && req.poid && req.done_by){  
        // var getpoquery = "select * from PO where zoneid="+req.zoneid+" and poid="+req.poid;
        var getpoquery = "select po.*,if(sum(pop.received_quantity>0),0,1) as delete_flag,if(sum(pop.received_quantity>0),1,0) as close_flag from PO as po left join POproducts as pop on pop.poid=po.poid where po.zoneid="+req.zoneid+" and po.poid="+req.poid+" group by po.poid order by po.poid desc";
        var getpo = await query(getpoquery);
        if(getpo.length>0){
            let resobj = { };
            //console.log("getpo[0].po_status==>",getpo[0].po_status);
            switch (getpo[0].po_status) {
                case 0:                    
                case 1:
                    if(getpo[0].close_flag==1){
                        //////Update PO///////////////
                        var updatepoquery = "update PO set po_status=3 where zoneid="+req.zoneid+" and poid="+req.poid;
                        var updatepo = await query(updatepoquery);

                        var updatepoquery = "update POproducts set pop_status=3 where poid="+req.poid;
                        var updatepo = await query(updatepoquery);
                        if(updatepo.affectedRows>0){
                            /////Remove Mapping Stock Quantity//////////
                            var checkpoid= [];
                            checkpoid.push({"poid":req.poid});
                            await SCM.update_stock_mapping_quantity(checkpoid[0],async function(err,stockmappingres){ });
                            ////////////PO Log ////////////////
                            polog_data = [];
                            polog_data.push({"poid":req.poid,"from_type":4,"zoneid":req.zoneid,"created_by":req.done_by});
                            POLog.createPOlog(polog_data[0],async function(err,polog_datares){  });                          

                            resobj = {
                                success: true,
                                status: true,
                                message: "updated successfully"
                            };
                            result(null, resobj);
                        }else{
                            resobj = {
                                success: true,
                                status: false,
                                message: "something went wrong plz try again"
                            };
                            result(null, resobj);
                        }
                    }else{
                        resobj = {
                            success: true,
                            status: false,
                            message: "no receiving products try to po delete"
                        };
                        result(null, resobj);
                    }                                      
                    break;
                case 2:
                    /////Already UN-Received//////  
                    resobj = {
                        success: true,
                        status: false,
                        message: "Already UN-Received"
                    };
                    result(null, resobj);                                                                                      
                    break;
                case 3:
                    /////Already Close////// 
                    console.log("3");
                    resobj = {
                        success: true,
                        status: false,
                        message: "Already Close"
                    };
                    result(null, resobj);
                    break;
                case 4:
                    /////Already Delete//////
                    resobj = {
                        success: true,
                        status: false,
                        message: "Already Delete"
                    };
                    result(null, resobj);
                    break;            
                default:
                    ////Default//////////
                    resobj = {
                        success: true,
                        status: false,
                        message: "no action performed"
                    };
                    result(null, resobj);
                    break;
            }  
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "in valid po id"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }     
};

//////////////Update product wise Stock Mapping Quantity//////////
SCM.update_stock_mapping_quantity =async function update_stock_mapping_quantity(req,result) {
    if(req.poid){ 
        /////Remove Mapping Stock Quantity//////////
        var popdatasquery = "select * from POproducts where poid="+req.poid;
        var popdatas = await query(popdatasquery);
        if(popdatas.length>0){
            for (let i = 0; i < popdatas.length; i++) {
                var reqqty = popdatas[i].requested_quantity;
                var receivedqty =parseInt(popdatas[i].received_quantity) + parseInt(popdatas[i].ditional_quantity);                       
                if(reqqty>receivedqty){
                    var updatedqty = parseInt(reqqty) - parseInt(receivedqty);
                    var getstockmappingquery = "select * from Stock where vpid="+popdatas[i].vpid;
                    var getstockmapping = await query(getstockmappingquery);
                    if(getstockmapping.length>0){
                        var upqty =parseInt(getstockmapping[0].quantity_mapping)-parseInt(updatedqty);
                        var updatemappinqty = 0;
                        if(upqty>0){
                            updatemappinqty = upqty;
                        }
                        var updatestockmappingquery = "update Stock set quantity_mapping="+upqty+" where vpid="+popdatas[i].vpid;
                        var updatestockmapping = await query(updatestockmappingquery);
                        if(updatestockmapping.affectedRows>0){
                            let resobj = {
                                success: true,
                                status: true,
                                message: "updated successfully"
                            };
                            result(null, resobj);
                        }else{
                            let resobj = {
                                success: true,
                                status: false,
                                message: "something went wrong"
                            };
                            result(null, resobj);
                        }
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "no stock"
                        };
                        result(null, resobj);
                    }                
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "in valid quantity"
                    };
                    result(null, resobj);
                }                
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no products available"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check post values"
        };
        result(null, resobj);
    }
};

/////////Delete POtemp///////////
SCM.delete_po_temp =async function delete_po_temp(req,result) {
    if(req.zoneid && req.temppoid){   
        var potempquery = "select * from POtemp where zoneid="+req.zoneid+" and tempid="+req.temppoid;
        var potemp = await query(potempquery);
        if(potemp.length>0){
            var updatepotempquery = "update POtemp set delete_status=1 where zoneid="+req.zoneid+" and tempid="+req.temppoid;
            var updatepotemp = await query(updatepotempquery);
            if(updatepotemp.affectedRows>0){
                var updateprocurmentquery = "update Procurement set pr_status=1 where zoneid="+req.zoneid+" and prid="+potemp[0].prid;
                var updateprocurment = await query(updateprocurmentquery);
            }
            if(updatepotemp.affectedRows>0 && updateprocurment.affectedRows>0){
                let resobj = {
                    success: true,
                    status: true,
                    message: "potemp deleted successfully"
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: true,
                    message: "something went wrong plz try again"
                };
                result(null, resobj);
            }            
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "invalid potemp id"
            };
            result(null, resobj);  
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }     
};

/////////Remove BOH Mapping///////////
SCM.remove_boh_mapping =async function remove_boh_mapping(req,result) {
    if(req.zoneid){   
        var emptybohmappingqtyquery = "update Stock set quantity_mapping=0";
        var emptybohmappingqty = await query(emptybohmappingqtyquery);
        if(emptybohmappingqty.affectedRows>0){            
            let resobj = {
                success: true,
                status: true,
                message: "procurement quantity removed successfully"
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
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check post values"
        };
        result(null, resobj);
    }     
};

/////Auto stock to dayorder product assign//////
SCM.auto_stock_to_dayorder =async function auto_stock_to_dayorder(req, result) {
    // console.log("update_dayorders-->1");
    if(req.zoneid){
        var getstocksquery = "select * from Stock where quantity !=0 and zoneid="+req.zoneid;
        var getstocks = await query(getstocksquery);

        if(getstocks.length > 0){
            for (let i = 0; i < getstocks.length; i++) {
                var getdayorderproductsquery = "select * from Dayorder_products where vpid="+getstocks[i].vpid+" and doid not in(select id from Dayorder where zoneid=1 and id IN(select DISTINCT(doid) from Dayorder_products where scm_status=4) and dayorderstatus=1 group by id,userid) order by created_at";
                var getdayorderproducts = await query(getdayorderproductsquery);

                if(getdayorderproducts.length > 0){
                    for (let j = 0; j < getdayorderproducts.length && getstocks[i].quantity>0; j++) {
                        if(getdayorderproducts[j].vpid == getstocks[i].vpid){ // && getdayorderproducts[j].sorting_status != 2
                            if(getdayorderproducts[j].quantity >= getdayorderproducts[j].received_quantity){
                                var qty = parseInt(getdayorderproducts[j].quantity) - parseInt(getdayorderproducts[j].received_quantity);
                                //////////////Product ful fill and sorting/////////
                                // if(getstocks[i].quantity >= qty){
                                //     var updateDOPquery = "update Dayorder_products set scm_status=3,received_quantity="+qty+" where id="+getdayorderproducts[j].id;
                                //     var updateDOP = await query(updateDOPquery);
                                //     if(updateDOP.affectedRows>0){
                                //         var stocklogdataout = [];
                                //         stocklogdataout.push({"stockid":getstocks[i].stockid,"vpid":getstocks[i].vpid,"dopid":getdayorderproducts[j].id,"type":2,"from_type":1,"quantity":qty,"zoneid":req.zoneid,"created_by":req.done_by});
                                //         StockLog.createStockLog(stocklogdataout[0], async function(err,stocklogdatares){ });
                                //     }
                                //     getstocks[i].quantity = parseInt(getstocks[i].quantity) - parseInt(qty);
                                // }        
                                
                                //////////////Product without ful fill and sorting/////////
                                if(getstocks[i].quantity>0){
                                    var upqty = 0;
                                    if(getstocks[i].quantity >= qty){                                                        
                                        var upqty = qty + parseInt(getdayorderproducts[j].received_quantity);
                                        getstocks[i].quantity = parseInt(getstocks[i].quantity) - parseInt(qty);
                                    }else{
                                        var upqty = parseInt(getstocks[i].quantity)+parseInt(getdayorderproducts[j].received_quantity);
                                        getstocks[i].quantity = 0;
                                    }                                                    
                                    var updateDOPquery = "update Dayorder_products set scm_status=3,received_quantity="+upqty+" where id="+getdayorderproducts[j].id;
                                    var updateDOP = await query(updateDOPquery);
                                    //////Stock Log OUT//////////
                                    if(updateDOP.affectedRows>0){
                                        var stocklogdataout = [];
                                        stocklogdataout.push({"stockid":getstocks[i].stockid,"vpid":getstocks[i].vpid,"dopid":getdayorderproducts[j].id,"type":2,"from_type":6,"quantity":upqty,"zoneid":req.zoneid,"created_by":req.done_by});
                                        StockLog.createStockLog(stocklogdataout[0], async function(err,stocklogdatares){ });
                                    }  
                                }
                            }
                        }
                    }
                    var updatestockquery = "update Stock set quantity="+getstocks[i].quantity+" and zoneid="+req.zoneid;
                    var updatestock = await query(updatestockquery);
                }         
            }
            let resobj = {
                success: true,
                status: true,
                message: "stock updated successfully"
            };
            console.log("resobj-->2",resobj);
            // return resobj;
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no stock"
            };
            // console.log("resobj-->2",resobj);
            // return resobj;
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post value"
        };
        // console.log("resobj-->2",resobj);
        // return resobj;
        result(null, resobj);
    }    
};

/////PO to DayOrder with Sorting////////////////
SCM.pop_to_dayorder =async function pop_to_dayorder(req, result) {
    if(req.zoneid && req.done_by && req.popid){
        var getpopquery = "select *,(received_quantity+aditional_quantity) as total_received_quantity from POproducts where popid="+req.popid;
        var getpop = await query(getpopquery);
        // console.log("getpop==>",getpop);
        if(getpop.length>0){
            //if(getpop[0].total_received_quantity >0){
                if(getpop[0].stand_by>0){
                    var stockdata = [];
                    stockdata.push({"vpid":getpop[0].vpid,"stand_by":getpop[0].stand_by,"zoneid":req.zoneid,"popid":req.popid,"done_by":req.done_by});
                    SCM.stock_check_update(stockdata[0],async function(err,stockres){
                        if(stockres.status==true){                                                        
                            // var totalqty = parseInt(stockres.result[0].quantity)+parseInt(getpop[0].stand_by);
                            // var updatestockquery  = "update Stock set quantity="+totalqty+" where vpid="+getpop[0].vpid+" and zoneid="+req.zoneid;
                            // var updatestock = await query(updatestockquery);  
                            // if(updatestock.affectedRows>0){
                                var getstockquery = "select * from Stock where vpid="+getpop[0].vpid;
                                var getstock = await query(getstockquery);
                                if(getstock.length>0){
                                    //// what ever you change this query need to chage ==>auto_stock_to_dayorder<== this function /////////////
                                    var getdayorderproductquery = "select * from Dayorder_products where scm_status in(2,3) and vpid="+getpop[0].vpid+" and doid not in(select id from Dayorder where zoneid=1 and id in(select DISTINCT(doid) from Dayorder_products where scm_status=4) and dayorderstatus=1 group by id,userid) order by created_at";
                                    var getdayorderproduct = await query(getdayorderproductquery);
                                    if(getdayorderproduct.length>0){
                                        for (let i = 0; i < getdayorderproduct.length && getstock[0].quantity>0; i++) {
                                            if(getdayorderproduct[i].quantity >= getdayorderproduct[i].received_quantity){
                                                var qty = parseInt(getdayorderproduct[i].quantity) - parseInt(getdayorderproduct[i].received_quantity);
                                                //////////////Product ful fill and sorting/////////
                                                // if(getstock[0].quantity >= qty){
                                                //     console.log("=====>3");
                                                //     var updateDOPquery = "update Dayorder_products set scm_status=3,received_quantity="+qty+",popid="+req.popid+" where id="+getdayorderproduct[i].id;
                                                //     var updateDOP = await query(updateDOPquery);
                                                //     //////Stock Log//////////
                                                //     if(updateDOP.affectedRows>0){
                                                //         console.log("=====>4");
                                                //         var stocklogdataout = [];
                                                //         stocklogdataout.push({"stockid":getstock[0].stockid,"vpid":getstock[0].vpid,"dopid":getdayorderproduct[i].id,"type":2,"from_type":1,"quantity":qty,"zoneid":req.zoneid,"created_by":req.done_by});
                                                //         StockLog.createStockLog(stocklogdataout[0], async function(err,stocklogdatares){ });
                                                //     }

                                                //     getstock[0].quantity = parseInt(getstock[0].quantity) - parseInt(qty);
                                                // }

                                                //////////////Product without ful fill and sorting/////////
                                                if(getstock[0].quantity>0){
                                                    var upqty = 0;
                                                    if(getstock[0].quantity >= qty){                                                        
                                                        var upqty = qty + parseInt(getdayorderproduct[i].received_quantity);
                                                        getstock[0].quantity = parseInt(getstock[0].quantity) - parseInt(qty);
                                                    }else{
                                                        var upqty = parseInt(getstock[0].quantity)+parseInt(getdayorderproduct[i].received_quantity);
                                                        getstock[0].quantity = 0;
                                                    }                                                    
                                                    var updateDOPquery = "update Dayorder_products set scm_status=3,received_quantity="+upqty+",popid="+req.popid+" where id="+getdayorderproduct[i].id;
                                                    var updateDOP = await query(updateDOPquery);
                                                    //////Stock Log OUT//////////
                                                    if(updateDOP.affectedRows>0){
                                                        console.log("=====>4");
                                                        var stocklogdataout = [];
                                                        stocklogdataout.push({"stockid":getstock[0].stockid,"vpid":getstock[0].vpid,"popid":req.popid,"dopid":getdayorderproduct[i].id,"type":2,"from_type":1,"quantity":upqty,"zoneid":req.zoneid,"created_by":req.done_by});
                                                        StockLog.createStockLog(stocklogdataout[0], async function(err,stocklogdatares){ });
                                                    }
                                                    
                                                }else{
                                                    console.log("=====>5");
                                                }
                                            }else{
                                                console.log("=====>6");
                                            }                      
                                        }
                                        
                                        var qtymapping = 0;
                                        qtymapping = parseInt(getstock[0].quantity_mapping) - parseInt(getpop[0].stand_by);
                                        if(qtymapping<0){
                                            qtymapping = 0;
                                        }

                                        var updatestockquery2 = "update Stock set quantity="+getstock[0].quantity+",quantity_mapping="+qtymapping+" where vpid="+getstock[0].vpid;
                                        console.log("updatestockquery2 ==>",updatestockquery2);
                                        var updatestock2 = await query(updatestockquery2);
                                        // console.log("updatestock2 ===>",updatestock2);
                                        //////Stock Log IN//////////
                                        // if(updatestock2.affectedRows>0){
                                        //     var stocklogdatain = [];
                                        //     stocklogdatain.push({"stockid":getstock[0].stockid,"vpid":getstock[0].vpid,"popid":req.popid,"type":1,"from_type":1,"quantity":getstock[0].quantity,"zoneid":req.zoneid,"created_by":req.done_by});
                                        //     StockLog.createStockLog(stocklogdatain[0], async function(err,stocklogdatares){ });
                                        // }
                                        
                                        //// update pop status //////// 
                                        var uppopqty = (parseInt(getpop[0].received_quantity)+parseInt(getpop[0].aditional_quantity))+parseInt(getpop[0].stand_by);
                                        var updatepopquery = "update POproducts set pop_status=1,sorting_status=1,stand_by=0,received_quantity="+uppopqty+" where popid="+req.popid;
                                        var updatepop = await query(updatepopquery);

                                        //// Check and update po status /////
                                        var checkupdatequery = "select pop.poid,count(pop.popid) as pop_count,count(case when pop.pop_status=1 then pop.popid end ) as pop_status_count  from POproducts as pop where pop.poid=(select poid from POproducts where popid="+req.popid+")";
                                        var checkupdate = await query(checkupdatequery);

                                        if(checkupdate.length>0){
                                            if(checkupdate[0].pop_count==checkupdate[0].pop_status_count){
                                                var updatepoquery = "update PO set po_status=1 where poid="+checkupdate[0].poid;
                                                var updatepo = await query(updatepoquery);
                                            }
                                        }
                                        
                                        if(updatestock2.affectedRows>0 && updatepop.affectedRows>0){
                                            let resobj = {
                                                success: true,
                                                status: true,
                                                message: "sorting completed"
                                            };
                                            result(null, resobj);
                                        }else{
                                            let resobj = {
                                                success: true,
                                                status: false,
                                                message: "something went wrong plz try again1"
                                            };
                                            result(null, resobj);
                                        }                                        
                                    }else{
                                        console.log("=====>7");
                                        let resobj = {
                                            success: true,
                                            status: false,
                                            message: "something went wrong plz try again2"
                                        };
                                        result(null, resobj);
                                    }
                                }else{
                                    let resobj = {
                                        success: true,
                                        status: false,
                                        message: "no stock"
                                    };
                                    result(null, resobj);
                                }
                            // }else{
                            //     let resobj = {
                            //         success: true,
                            //         status: false,
                            //         message: "stock not updated try again3"
                            //     };
                            //     result(null, resobj);
                            // }
                        }else{
                            let resobj = {
                                success: true,
                                status: false,
                                message: "stock not updated try again4"
                            };
                            result(null, resobj);
                        }
                    });
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "no stand by quanty"
                    };
                    result(null, resobj);
                }
            // }else{
            //     let resobj = {
            //         success: true,
            //         status: false,
            //         message: "plz check received quantity"
            //     };
            //     result(null, resobj);
            // }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "invalid pop id"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }
};

/////check stock and update////////////////
SCM.stock_check_update =async function stock_check_update(req, result) {
    if(req.zoneid && req.vpid && req.stand_by){
        var getstockpricequery1 = "select * from Stock where vpid="+req.vpid+" and zoneid="+req.zoneid;
        var getstockprice1 = await query(getstockpricequery1);
        if(getstockprice1.length > 0){
            var totalqty = parseInt(getstockprice1[0].quantity)+parseInt(req.stand_by); 
            var updatestockquery  = "update Stock set quantity="+totalqty+" where vpid="+req.vpid+" and zoneid="+req.zoneid;
            var updatestock = await query(updatestockquery); 
            if(updatestock.affectedRows>0){
                //////Stock Log IN//////////
                var stocklogdatain = [];
                stocklogdatain.push({"stockid":getstockprice1[0].stockid,"vpid":getstockprice1[0].vpid,"popid":req.popid,"type":1,"from_type":1,"quantity":req.stand_by,"zoneid":req.zoneid,"created_by":req.done_by});
                console.log("stocklogdatain ==>1111",stocklogdatain);
                StockLog.createStockLog(stocklogdatain[0], async function(err,stocklogdatares){ });
                
                var getstockpricequery = "select * from Stock where vpid="+req.vpid+" and zoneid="+req.zoneid;
                var getstockprice = await query(getstockpricequery);

                let resobj = {
                    success: true,
                    status: true,
                    result: getstockprice
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "stock insert issue try again1"
                };
                result(null, resobj);
            }            
        }else{
            var stockdata = [];
            stockdata.push({"vpid":req.vpid,"quantity":req.stand_by,"zoneid":req.zoneid});
            Stock.createStock(stockdata[0],async function(err,stockres){
                if(stockres.status==true){
                    //////Stock Log IN//////////
                    var stocklogdatain = [];
                    stocklogdatain.push({"stockid":stockres.result.insertId,"vpid":req.vpid,"popid":req.popid,"type":1,"from_type":1,"quantity":req.stand_by,"zoneid":req.zoneid,"created_by":req.done_by});
                    console.log("stocklogdatain ==>2222",stocklogdatain);
                    StockLog.createStockLog(stocklogdatain[0], async function(err,stocklogdatares){ });
                    
                    var getstockpricequery = "select * from Stock where vpid="+req.vpid+" and zoneid="+req.zoneid;
                    var getstockprice = await query(getstockpricequery);
                    if(getstockprice.length>0){                        
                        let resobj = {
                            success: true,
                            status: true,
                            result: getstockprice
                        };
                        result(null, resobj);
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "stock insert issue try again2"
                        };
                        result(null, resobj);
                    }
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "stock insert issue try again3"
                    };
                    result(null, resobj);
                }
            });
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "fill all required fields"
        };
        result(null, resobj);
    }
};

/////////Get Sorting List///////////
SCM.get_soring_list =async function get_soring_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

        var where = "";
        if(req.doid){
            where = where+" and dayo.id="+req.doid;
        }
        if(req.from_date && req.to_date){
            where = where+" and (date(dayo.date) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }
        if(req.report && req.report==1){
            var getpolistquery = "select dayo.date,dayo.id as doid,dayo.dayorderstatus,dayo.revoke_flag,JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid', dop.vpid,'product_name',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'sorting_status',dop.sorting_status,'scm_status',dop.scm_status,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight),'report_quantity',0,'report_flag',0)) AS products,0 as actival_weight,0 as received_weight,0 as action from Dayorder as dayo left join Dayorder_products as dop on dop.doid=dayo.id where dayo.dayorderstatus=1 and dayo.id IN (select DISTINCT(doid) from Dayorder_products where scm_status=3) and dayo.zoneid="+req.zoneid+" "+where+" group by dayo.id";
        }else{
            var getpolistquery = "select dayo.date,dayo.id as doid,dayo.dayorderstatus,dayo.revoke_flag,JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid', dop.vpid,'product_name',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'sorting_status',dop.sorting_status,'scm_status',dop.scm_status,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight),'report_quantity',0,'report_flag',0)) AS products,0 as actival_weight,0 as received_weight,0 as action from Dayorder as dayo left join Dayorder_products as dop on dop.doid=dayo.id where dayo.dayorderstatus=1 and dayo.id IN (select DISTINCT(doid) from Dayorder_products where scm_status=3) and dayo.zoneid="+req.zoneid+" "+where+" group by dayo.id order by dayo.id limit " +startlimit +"," +pagelimit +" ";
        }
        var getpolist = await query(getpolistquery);

        var totalcountquery = "select dayo.date,dayo.id as doid,dayo.dayorderstatus,dayo.revoke_flag,JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid', dop.vpid,'product_name',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'sorting_status',dop.sorting_status,'scm_status',dop.scm_status,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight),'report_quantity',0,'report_flag',0)) AS products,0 as actival_weight,0 as received_weight,0 as action from Dayorder as dayo left join Dayorder_products as dop on dop.doid=dayo.id where dayo.dayorderstatus=1 and dayo.id IN (select DISTINCT(doid) from Dayorder_products where scm_status=3) and dayo.zoneid="+req.zoneid+" "+where+" group by dayo.id";
        var total_count = await query(totalcountquery);
        
        if(getpolist.length > 0){
            for (let i = 0; i < getpolist.length; i++) {
                getpolist[i].products = JSON.parse(getpolist[i].products);
                var productlist = getpolist[i].products;
                for (let j = 0; j < productlist.length; j++) {
                    getpolist[i].actival_weight = parseInt(getpolist[i].actival_weight)+parseInt(productlist[j].actival_weight);
                    getpolist[i].received_weight =parseInt(getpolist[i].received_weight)+parseInt(productlist[j].received_weight);
                    
                    // var getreprtingqtyquery = "select if(sum(report_quantity),sum(report_quantity),0) as report_quantity from Missing_Quantity_Report where report_type=1 and dopid="+productlist[j].dopid;
                    // var getreprtingqty = await query(getreprtingqtyquery);
                    
                    // if(getreprtingqty.length>0){
                    //     productlist[j].report_quantity = getreprtingqty[0].report_quantity;
                        
                    // }
                }

                // var checkscmquery = "select count(id) as dop_count,count(case when scm_status>=2 then id end) as scm2_count,count(case when received_quantity>0 then id end) as recevied_count from Dayorder_products where doid="+getpolist[i].doid;        
                // var checkscm = await query(checkscmquery);
                // if(checkscm.length>0){
                //     if(checkscm[0].recevied_count>0){
                //         getpolist[i].action = 1;
                //     }
                // }
            }

            // if (!getpolist.action) {
            //     getpolist.sort((a, b) => parseFloat(b.action) - parseFloat(a.action));
            // }            
            // if(getpolist[0].actival_weight > 0 || getpolist[0].received_weight > 0){
                var totalcount = total_count.length; 
                let resobj = {
                    success: true,
                    status: true,
                    totalcount: totalcount,
                    pagelimit: pagelimit,
                    result: getpolist
                };
                result(null, resobj);
            // }            
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no records found"
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

/////////Move to QA///////////
SCM.save_sorting =async function save_sorting(req,result) {
    if(req.dopid_list){
        for (let i = 0; i < req.dopid_list.length; i++) {
            var getdopquery = "select * from Dayorder_products where id="+req.dopid_list[i];
            var getdop = await query(getdopquery);
            var sorting_status = 3;
            if(getdop.length > 0){
                if(getdop[0].quantity <= getdop[0].received_quantity){
                    sorting_status = 2;
                }else if(getdop[0].quantity > getdop[0].received_quantity){
                    sorting_status = 1;
                }
            }
            var updatedopquery = "update Dayorder_products set sorting_status="+sorting_status+" where id="+req.dopid_list[i];
            var updatedop = await query(updatedopquery);
        } 
        let resobj = {
            success: true,
            status: true,
            message: "sorting saved"
        };
        result(null, resobj);      
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post values"
        };
        result(null, resobj);
    }  
};

/////////Move to QA///////////
SCM.move_to_qa =async function move_to_qa(req,result) {
    if(req.dopid_list && req.done_by){
        var error_poid= [];
        var error_poid_msg = "";
        for (let i = 0; i < req.dopid_list.length; i++) {
            var getdopquery = "select * from Dayorder_products where id="+req.dopid_list[i];
            var getdop = await query(getdopquery);
            var sorting_status = 3;
            if(getdop.length > 0 && getdop[0].scm_status==3){
                if(getdop[0].quantity <= getdop[0].received_quantity){
                    sorting_status = 2;
                }else if(getdop[0].quantity > getdop[0].received_quantity){
                    sorting_status = 1;
                }
                var updatedopquery = "update Dayorder_products set sorting_status="+sorting_status+",scm_status=4 where id="+req.dopid_list[i];
                var updatedop = await query(updatedopquery);

                if(getdop[0].revoke_flag==1){
                    var updateDO_revoke = await query("update Dayorder set revoke_flag=0 where id = '"+getdop[0].doid+"'");
                }

                ////////Create Day order Log ////////////
                var insertlogdata = [];
                insertlogdata.push({"comments":"moved from sorting to qc","done_by":req.done_by,"doid":getdop[0].doid,"type":1,"done_type":1});
                DayOrderComment.create_OrderComments_crm(insertlogdata);  
                //////// change po status from 0 to 1 ///////////
            }else{
                error_poid.push(req.dopid_list[i]);
            }       
        }

        if(error_poid.length>0){
            error_poid_msg= error_poid+" plz sort this dayorder products";
        }
        let resobj = {
            success: true,
            status: true,
            message: "moved to QC",
            error_msg: error_poid
                       
        };
        result(null, resobj);      
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post values"
        };
        result(null, resobj);
    } 
};

/////////Missing Quantity Report [Sorting and QA]///////////
SCM.missing_quantity_report =async function missing_quantity_report(req,result) {
    if(req.zoneid && req.dopid && req.report_quantity && req.vpid && req.report_type && req.from_type){
        var insert_MQR_data= [];
        insert_MQR_data.push({"dopid":req.dopid,"vpid":req.vpid,"report_quantity":req.report_quantity,"report_type":req.report_type,"from_type":req.from_type,"zoneid":req.zoneid,});        
        MissingQuantity_Report.createMissingQuantityReport(insert_MQR_data[0],async function(err,insert_MQR_res){
            if(insert_MQR_res.success==true){
                if(req.report_type == 1){
                    var unreceive_data = [];
                    unreceive_data.push({"dopid":req.dopid,"vpid":req.vpid ,"report_quantity":req.report_quantity,"zoneid":req.zoneid,"from_type":req.from_type});
                    SCM.update_po_unreceive_from_sorting(unreceive_data[0],async function(err,unreceive_datares){
                        if(unreceive_datares.status == true){
                            let resobj = {
                                success: true,
                                status: true,
                                message: "sorting Reported successfully"
                            };
                            result(null, resobj);
                        }else{
                            let resobj = {
                                success: true,
                                status: false,
                                result: unreceive_datares
                            };
                            result(null, resobj);
                        }
                    });
                }else if(req.report_type == 2){
                    var wastmanagement_data = [];
                    wastmanagement_data.push({"dopid":req.dopid,"vpid":req.vpid,"quantity":req.report_quantity,"from_type":req.from_type,"zoneid":req.zoneid});
                    WasteManagement.createWasteManagement(wastmanagement_data[0],async function(err,wastmanagement_datares){
                        if(wastmanagement_datares.status==true){
                            var getdopquery = "select * from Dayorder_products where id="+req.dopid;
                            var getdop = await query(getdopquery);
                            if(getdop.length>0){
                                var qty = parseInt(getdop[0].received_quantity) - parseInt(req.report_quantity);
                                var updatedopquery = "update Dayorder_products set received_quantity="+qty+" where id="+req.dopid;
                                var updatedop = await query(updatedopquery);
                            }                            
                            let resobj = {
                                success: true,
                                status: true,
                                message: "sorting Reported successfully"
                            };
                            result(null, resobj);
                        }else{
                            let resobj = {
                                success: true,
                                status: false,
                                message: "something went wrong in wast management insert plz try again"
                            };
                            result(null, resobj);
                        }
                    });
                }               
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "check your post values"
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

////////Get Quality Type List/////////////
SCM.quality_type_list =async function quality_type_list(req,result) {
    var QC_typesquery = "select * from QC_types";
    var QC_types = await query(QC_typesquery);
    if(QC_types.length > 0){
        let resobj = {
            success: true,
            status: true,
            result: QC_types
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

////////Update Quantity Check/////////////
SCM.quality_check_product =async function quality_check_product(req,result) {
    if (req.type==1) {        
        for (let i=0; i<req.checklist.length; i++) {
            for (let j=0; j<req.checklist[i].qclist.length; j++) {    
                var check_list = {};
                check_list.vpid =  req.checklist[i].vpid;
                check_list.doid = req.doid;
                check_list.qcid = req.checklist[i].qclist[j].qcid;
                check_list.qcvalue = req.checklist[i].qclist[j].qcvalue;
                
                var new_check_list = new QC_check_list(check_list);
                QC_check_list.create_qc_check_list(new_check_list, function(err, res2) {
                    if (err) { 
                        sql.rollback(function() {                     
                        result(err, null);
                        });
                    }
                });                             
            }           
        }
        var update = await query("update Dayorder_products set scm_status=5 where doid = '"+req.doid+"'");
        var updateDO = await query("update Dayorder set dayorderstatus=5 where id = '"+req.doid+"'");

        //////Create Day order Log ////////////
        var insertlogdata = [];
        insertlogdata.push({"comments":"QA Completed","done_by":req.done_by,"doid":req.doid,"type":1,"done_type":1});
        DayOrderComment.create_OrderComments_crm(insertlogdata);  

        //////// Customer App Notification //////////
        var orders = await query("SELECT ors.*,us.pushid_ios,us.pushid_android,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail,DATE_FORMAT(mt.created_at, '%d-%m-%Y') as timeofdispatch,DATE_FORMAT(qc.created_at, '%d-%m-%Y') as timeofqc,JSON_ARRAYAGG(JSON_OBJECT('dpoid',dop.id,'doid',dop.doid,'vpid',dop.vpid,'productname',dop.productname,'requested_qty',dop.quantity,'received_qty',dop.received_quantity)) as products,'' as missingproducts from Dayorder as ors left join Dayorder_products as dop on dop.doid=ors.id left join User as us on ors.userid=us.userid left join Moveit_trip as mt on mt.tripid=ors.trip_id left join QC_check_list as qc on qc.doid=ors.id where ors.id = '"+req.doid+"' group by ors.id" );

        orders[0].products = JSON.parse(orders[0].products);    
        var products = orders[0].products;
        var missingproducts = [];
        for (let j = 0; j < products.length; j++) {
            if(products[j].requested_qty > products[j].received_qty){
                var missqty = parseInt(products[j].requested_qty)-parseInt(products[j].received_qty);
                missingproducts.push({"vpid":products[j].vpid,"productname":products[j].productname,"missingqty":missqty});
            }            
        }
        orders[0].missingproducts = missingproducts;
        await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_ready_at_wherehouse_notification);

        let resobj = {
            success: true,
            status: true,
            message: "Product Quality chcek has been done"
        };
        result(null, resobj);
    } else {        
        var update_revoke = await query("update Dayorder_products set scm_status=3 where doid = '"+req.doid+"'");
        var updateDO_revoke = await query("update Dayorder set revoke_flag=1 where id = '"+req.doid+"'");

        //////Create Day order Log ////////////
        var insertlogdata = [];
        insertlogdata.push({"comments":"revoke moved from qc to sorting","done_by":req.done_by,"doid":req.doid,"type":1,"done_type":1});
        DayOrderComment.create_OrderComments_crm(insertlogdata);  

        let resobj = {
            success: true,
            status: true,
            message: "Product Revoke has been done"
        };
        result(null, resobj);
    }
};

/////////Get Return List///////////
SCM.get_return_list =async function get_return_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

        var where = "";
        if(req.doid){
            where = where+" and dayo.id='"+req.doid+"' ";
        }
        
        if(req.from_date && req.to_date){
            wherecon = wherecon+" and (date(dayo.date) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }

        if(req.report && req.report==1){
            var getpolistquery = "select dayo.date,dayo.id as doid,dayo.dayorderstatus,dayo.revoke_flag,JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid', dop.vpid,'product_name',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'driver_return_quantity',dop.driver_return_quantity,'sorting_status',dop.sorting_status,'scm_status',dop.scm_status,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight),'report_quantity',0,'report_flag',0)) AS products,0 as actival_weight,0 as received_weight,0 as action from Dayorder as dayo left join Dayorder_products as dop on dop.doid=dayo.id where dayo.dayorderstatus=12 and return_status=1 and dayo.zoneid="+req.zoneid+" "+where+" group by dayo.id order by dayo.id asc ";
        }else{
            var getpolistquery = "select dayo.date,dayo.id as doid,dayo.dayorderstatus,dayo.revoke_flag,JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid', dop.vpid,'product_name',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'driver_return_quantity',dop.driver_return_quantity,'sorting_status',dop.sorting_status,'scm_status',dop.scm_status,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight),'report_quantity',0,'report_flag',0)) AS products,0 as actival_weight,0 as received_weight,0 as action from Dayorder as dayo left join Dayorder_products as dop on dop.doid=dayo.id where dayo.dayorderstatus=12 and return_status=1 and dayo.zoneid="+req.zoneid+" "+where+" group by dayo.id order by dayo.id asc limit " +startlimit +"," +pagelimit +" ";
        }        
        var getpolist = await query(getpolistquery);
        //  console.log("getpolist==>",getpolist);

        var totalcountquery = "select dayo.date,dayo.id as doid,dayo.dayorderstatus,dayo.revoke_flag,JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid', dop.vpid,'product_name',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'driver_return_quantity',dop.driver_return_quantity,'sorting_status',dop.sorting_status,'scm_status',dop.scm_status,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight),'report_quantity',0,'report_flag',0)) AS products,0 as actival_weight,0 as received_weight,0 as action from Dayorder as dayo left join Dayorder_products as dop on dop.doid=dayo.id where dayo.dayorderstatus=12 and return_status=1 and dayo.zoneid="+req.zoneid+" "+where+" group by dayo.id";
        var total_count = await query(totalcountquery);

        if(getpolist.length > 0){
            for (let i = 0; i < getpolist.length; i++) {
                getpolist[i].products = JSON.parse(getpolist[i].products);
                var productlist = getpolist[i].products;
                for (let j = 0; j < productlist.length; j++) {
                    getpolist[i].actival_weight = parseInt(getpolist[i].actival_weight)+parseInt(productlist[j].actival_weight);
                    getpolist[i].received_weight =parseInt(getpolist[i].received_weight)+parseInt(productlist[j].received_weight);     
                }
            }
            var totalcount = total_count.length;   
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: getpolist
            };
            result(null, resobj);                  
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no records found"
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

/////////Update Retutn Orders///////////
SCM.update_return_orders =async function update_return_orders(req,result) {
    if(req.zoneid && req.doid && req.products.length>0){
        var products = req.products;
        var checkdayorderquery = "select * from Dayorder where id="+req.doid;
        var checkdayorder = await query(checkdayorderquery);
        
        if(checkdayorder.length>0){
            if(checkdayorder[0].dayorderstatus==12){
                if(checkdayorder[0].return_status==1){
                    var grttripquery = "select * from Moveit_trip where tripid="+checkdayorder[0].trip_id;
                    var grttrip = await query(grttripquery);

                    for (let i = 0; i < products.length; i++) {
                        var updatedopquery = "update Dayorder_products set driver_return_quantity="+products[i].quantity+" where id="+products[i].dopid;
                        var updatedop = await query(updatedopquery);
                        if(products[i].type==1){
                            ////Push To stock/////
                            var checkstockquery = "select * from Stock where vpid="+products[i].vpid;
                            var checkstock = await query(checkstockquery);
                            if(checkstock.length>0){
                                var updateqty = parseInt(checkstock[0].quantity)+parseInt(products[i].quantity);
                                var updatestockquery = "update Stock set quantity="+updateqty+" where vpid="+products[i].vpid;
                                var updatestock = await query(updatestockquery);
            
                                ////////Stock in Log//////////////
                                var stocklogdataout = [];
                                stocklogdataout.push({"stockid":checkstock[0].stockid,"vpid":checkstock[0].vpid,"dopid":products[i].dopid,"type":1,"from_type":5,"quantity":products[i].quantity,"zoneid":req.zoneid});
                                StockLog.createStockLog(stocklogdataout[0], async function(err,stocklogdatares){
                                    if(stocklogdatares.status==true){ }else{ }
                                 });                    
                            }
                        }else if(products[i].type==2){
                            var wastmanagement_data = [];
                            wastmanagement_data.push({"dopid":products[i].dopid,"vpid":products[i].vpid,"quantity":products[i].quantity,"from_type":5,"zoneid":req.zoneid});
                            WasteManagement.createWasteManagement(wastmanagement_data[0],async function(err,wastmanagement_datares){
                                if(wastmanagement_datares.status==true){ }else{ }
                            });
                        }
                    }

                    ////// Update Trip Status /////////////
                    await MoveitUserModel.updatetripstatus(checkdayorder[0].trip_id);

                    ////// Update Moveit Status ///////////
                    var insertmoveitstatus = "insert into Moveit_status (doid,moveitid,status) values("+req.doid+","+grttrip[0].moveit_id+",9)";
                    var insertmoveit = await query(insertmoveitstatus);
            
                    var updatedayorderquery = "update Dayorder set return_status=2 where id="+req.doid;
                    var updatedayorder = await query(updatedayorderquery);
                    ////////Create Day order Log ////////////
                    var insertlogdata = [];
                    insertlogdata.push({"comments":"Order Retrun accepted in SCM ","done_by":req.done_by,"doid":req.doid,"type":1,"done_type":1});
                    DayOrderComment.create_OrderComments_crm(insertlogdata);  

                    
                    let resobj = {
                        success: true,
                        status: true,
                        message: "sorting Reported successfully"
                    };
                    result(null, resobj);
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "In valid return_status"
                    };
                    result(null, resobj);
                }
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "In valid dayorder status"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "In valid Order id"
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

/////////Reorder to Sorting///////////
SCM.return_reorder =async function return_reorder(req,result) {
    if(req.zoneid && req.doid){
        var checkdayorderquery = "select * from Dayorder where id="+req.doid;
        var checkdayorder = await query(checkdayorderquery);
        if(checkdayorder.length>0){
            if(checkdayorder[0].dayorderstatus == 12){
                if(checkdayorder[0].return_status == 1){
                    var grttripquery = "select * from Moveit_trip where tripid="+checkdayorder[0].trip_id;
                    var grttrip = await query(grttripquery);

                    var updatedayorderquery = "update Dayorder set dayorderstatus=1,return_status=3,trip_id=NULL,moveit_type=NULL where id="+req.doid;
                    var updatedayorder = await query(updatedayorderquery);
    
                    var updatedopquery = "update Dayorder_products set scm_status=3 where doid="+req.doid;
                    var updatedop = await query(updatedopquery);

                    ////////Delete QA CheckList //////////////
                    var updateqaquery = "delete from QA_check_list where doid="+req.doid;
                    var updateqa = await query(updateqaquery);
    
                    ////////Create Day order Log ////////////
                    var insertlogdata = [];
                    insertlogdata.push({"comments":"return to Sorting ","done_by":req.done_by,"doid":req.doid,"type":1,"done_type":1});
                    DayOrderComment.create_OrderComments_crm(insertlogdata);  
                    ///////// Trip Status Update////////////////////////////
                    await MoveitUserModel.updatetripstatus(checkdayorder[0].trip_id);

                    ////// Update Moveit Status ///////////
                    var insertmoveitstatus = "insert into Moveit_status (doid,moveitid,status) values("+req.doid+","+grttrip[0].moveit_id+",9)";
                    var insertmoveit = await query(insertmoveitstatus);

                    let resobj = {
                        success: true,
                        status: true,
                        message: "return to sorting successfully"
                    };
                    result(null, resobj);
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "plz check reorder status"
                    };
                    result(null, resobj);
                }                
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "plz check order status"
                };
                result(null, resobj); 
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "invalid doid"
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

///////PO Auto Creation Loop//////
SCM.autopopdfcreate =async function autopopdfcreate(req,result) {
    var getpolistquery = "select * from PO where po_pdf_url IS NULL";
    var getpolist = await query(getpolistquery);
    if(getpolist.length>0){
        for (let i = 0; i < getpolist.length; i++) {
            var popdfid = [];
            popdfid.push({"poid":getpolist[i].poid});
            await SCM.po_pdf(popdfid[0],async function(err, popdfres){
                if(popdfres.status==true){
                    var updatepopdfurlquery = "update PO set po_pdf_url='"+popdfres.url.filename+"' where poid="+getpolist[i].poid;
                    var updatepopdfurl = await query(updatepopdfurlquery);
                }
            });
        }
        let resobj = {
            success: true,
            status: true,
            message: "po created successfully"
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "sorry no po"
        };
        result(null, resobj);
    }
};

///////Invoice Auto Creation Loop//////
SCM.autoinvoicepdfcreate =async function autoinvoicepdfcreate(req,result) {
    var getdayolistquery = "select * from Dayorder where invoice_url IS NULL";
    var getdayolist = await query(getdayolistquery);
    if(getdayolist.length>0){
        for (let i = 0; i < getdayolist.length; i++) {
            var invoicepdfid = [];
            invoicepdfid.push({"doid":getdayolist[i].id});
            await SCM.invoice_pdf(invoicepdfid[0],async function(err, invoicepdfdfres){
                if(invoicepdfdfres.status==true){
                    var updatepopdfurlquery = "update Dayorder set invoice_url='"+invoicepdfdfres.url.filename+"',invoice_no='INV"+getdayolist[i].id+"' where id="+getdayolist[i].id;
                    var updatepopdfurl = await query(updatepopdfurlquery);
                }
            });
        }
        let resobj = {
            success: true,
            status: true,
            message: "Invoice created successfully"
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "sorry no Invoice"
        };
        result(null, resobj);
    }
};

module.exports = SCM;