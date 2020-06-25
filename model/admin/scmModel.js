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
var QA_check_list = require("../../model/common/qualitychecklistModel.js");
var Stock = require('../tableModels/stockTableModel.js');
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require('constants');


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
    if(req.zone_id){
        var getwaitingpouery = "select pot.tempid,pot.prid,cat.catid,cat.name as catagory_name,scl1.scl1_id,scl1.name as subcatL1name,scl2.scl2_id,scl2.name as subcatL2name,pot.vpid,dop.Productname,dop.product_productdetails,dop.product_uom as uomid,uom.name as uom_name,pot.actual_quantity,pot.requested_quantity,pot.vid,ven.name as vendor_name,vpm.base_price as rate,pot.due_date,vpm.other_charges,pot.buyer_comment,(pot.requested_quantity*(vpm.base_price+vpm.other_charges)) as amount from POtemp as pot left join Dayorder_products as dop on dop.prid=pot.prid left join SubcategoryL2 as scl2 on scl2.scl2_id=dop.product_scl1_id left join SubcategoryL1 as scl1 on scl1.scl1_id=dop.product_scl1_id left join Category as cat on cat.catid=scl1.catid left join UOM as uom on uom.uomid=dop.product_uom left join Vendor_products_mapping as vpm on vpm.vid=pot.vid left join Vendor as ven on ven.vid=pot.vid where pot.delete_status=0 and pot.zoneid="+req.zone_id+" group by pot.tempid";

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
    if(req.zone_id & req.products.length>0){        
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
    if(req.zone_id & req.tempid.length>0){                   
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
                    var updatepotempquery = "update POtemp set vid="+req.vid+",due_date='"+due_date+"',buyer_comment='"+buyer_comment+"' where tempid in("+req.tempid[i]+")";
                    var updatepotemp = await query(updatepotempquery); 
                }else{
                    var updatepotempquery = "update POtemp set vid="+req.vid+",due_date='"+due_date+"',buyer_comment='"+buyer_comment+"',requested_quantity="+getpotemp[0].actual_quantity+" where tempid in("+req.tempid[i]+")";
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
    if(req.zone_id && req.tempid && req.requested_quantity){                   
        var due_date  = "0000-00-00";
        var buyer_comment = "";
        if(req.due_date){
            due_date = req.due_date;
        }
        if(req.buyer_comment){
            buyer_comment = req.buyer_comment;
        }
        var updatepotempquery = "update POtemp set requested_quantity="+req.requested_quantity+" where tempid="+req.tempid;
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
    if(req.zone_id && req.templist){
        var polistquery = "select tempid,prid,vpid,vid,requested_quantity as qty,due_date,buyer_comment from POtemp where tempid in("+req.templist+") and vpid IS NOT NULL and vid IS NOT NULL and requested_quantity IS NOT NULL and due_date IS NOT NULL and delete_status=0";        
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
                ////Insert PO  and get id///
                var podata = [];
                podata.push({"vid":uniquevendors[i],"zoneid":req.zone_id,"po_status":0});
                // console.log("podata --->",podata);
                PO.createPO(podata,async function(err,pores){
                    if(pores.status==true){
                        poids.push(pores.result.insertId);
                        // console.log("Step 3: inserted pores createPO-->",pores.result.insertId);

                        var  vendor_polist = polist.filter(item => item.vid == uniquevendors[i]);
                        // console.log("Step 4: filter by vendorid in polist-->",vendor_polist);
                        var vendorcost = 0;
                        for (let j = 0; j < vendor_polist.length; j++) {
                            if(vendor_polist[j].vid == uniquevendors[i]){
                                var getvendorcostquery = "select * from Vendor_products_mapping where vid="+vendor_polist[j].vid+" and pid="+vendor_polist[j].vpid;
                                var getvendorcost = await query(getvendorcostquery);
                                console.log("getvendorcost -->",j,"=>",getvendorcost);
                                if(getvendorcost.length>0){
                                    var inserpopdata = [];
                                    inserpopdata.push({"poid":pores.result.insertId,"prid":vendor_polist[j].prid,"vpid":vendor_polist[j].vpid,"vid":vendor_polist[j].vid,"cost":getvendorcost[0].base_price*vendor_polist[j].qty,"other_charges":getvendorcost[0].other_charges*vendor_polist[j].qty,"requested_quantity":vendor_polist[j].qty,"pop_status":0,"due_date":vendor_polist[j].due_date,"buyer_comment":vendor_polist[j].buyer_comment});
                                    POProducts.createPOProducts(inserpopdata,async function(err,popres){
                                        // console.log("Step 5: after popres createPOProducts ==>",popres);
                                        if(popres.status==true){
                                            /////Delete PO Temp///////////
                                            var updatepotempquery = "update POtemp set delete_status=1 where tempid="+vendor_polist[j].tempid;
                                            var updatepotemp = await query(updatepotempquery);
                                        }
                                    });
                                    
                                    vendorcost = parseInt(vendorcost)+(( parseInt(getvendorcost[0].base_price) * parseInt(vendor_polist[j].qty) ) + ( parseInt(getvendorcost[0].other_charges) * parseInt(vendor_polist[j].qty) ));
                                    // console.log("Step 6: sum of vendor cost ==>",vendorcost);
                                }
                                /////Update Dayorder product status =>removed///////
                            }
                        }

                        if(vendorcost > 0 ){
                            var checkquery = "UPDATE PO SET cost="+vendorcost+" WHERE poid ="+pores.result.insertId;
                            // console.log("checkquery -->",checkquery);
                            var check = await query(checkquery);
                            // console.log("Step 7: updated po ==>",check);
                        }
                    }else{  }
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
    if(req.zone_id){
        var where = "";
        if(req.poid){
            where = where+" and po.poid="+req.poid;
        }
        if(req.date){
            where = where+" and date(po.created_at)='"+req.date+"' ";
        }
        if(req.pop_status){
            where = where+" and pop.pop_status="+req.pop_status;
        }
        if(req.vid){
            where = where+" and po.vid='"+req.vid+"' or ven.name='"+req.vid+"' ";
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

        var getpolistquery = "select po.poid,po.vid,ven.name,po.created_at,if(sum(pop.requested_quantity),sum(pop.requested_quantity),0) as total_quantity,if(sum(pop.requested_quantity-pop.received_quantity),sum(pop.requested_quantity-pop.received_quantity),0) as open_quqntity, if(sum(pop.received_quantity),sum(pop.received_quantity),0) as received_quantity,po.cost,pop.due_date,po.po_status from PO as po left join POproducts as pop on pop.poid=po.poid left join Vendor as ven on ven.vid=po.vid where po.zoneid="+req.zone_id+" "+where+" group by po.poid";
        var getpolist = await query(getpolistquery);
        if(getpolist.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getpolist
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

/////////Get PO receive List///////////
SCM.get_po_receive_list =async function get_po_receive_list(req,result) {
    if(req.zone_id){
        var where = "";
        if(req.date){
            where = where+" and date(po.created_at)='"+req.date+"' ";
        }
        if(req.vpid){
            where = where+" and pop.vpid='"+req.vpid+"' or pm.Productname='"+req.vpid+"' ";
        }
        if(req.vid){
            where = where+" and po.vid='"+req.vid+"' or ven.name='"+req.vid+"' ";
        }
        if(req.poid){
            where = where+" and po.poid="+req.poid;
        }
        var getpolistquery = "select pop.popid,po.poid,pop.vpid,dop.productname,dop.product_short_desc,uom.name as uom,po.vid,ven.name,po.created_at,if(st.quantity,st.quantity,0) as boh,if(sum(pop.requested_quantity), sum(pop.requested_quantity),0) as total_quantity,if(sum(pop.requested_quantity-pop.received_quantity),sum(pop.requested_quantity-pop.received_quantity),0) as open_quqntity, if(sum(pop.received_quantity), sum(pop.received_quantity),0) as received_quantity,po.cost,po.po_status,pop.pop_status from POproducts as pop left join PO as po on po.poid = pop.poid left join Vendor as ven on ven.vid=po.vid left join Dayorder_products as dop on dop.prid=pop.prid left join UOM as uom on uom.uomid=dop.product_uom left join Stock as st on st.vpid=pop.vpid where po.zoneid="+req.zone_id+" and po.po_status=0 "+where+" group by pop.popid";

        var getpolist = await query(getpolistquery);
        if(getpolist.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: getpolist
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

/////////Update PO receive///////////
SCM.update_po_receive =async function update_po_receive(req,result) {
    if(req.zone_id && req.popid && req.vpid && req.quantity){   
        var dn = "";
        if(req.delivery_note){
            dn = req.delivery_note;
        }

        var getpopquery = "select poid,popid,vpid,requested_quantity,(received_quantity+aditional_quantity) as total_received_quantity from POproducts where popid="+req.popid;
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
            
            var updatepopquery  = "update POproducts set pop_status=1,delivery_note='"+dn+"',received_quantity="+receive_qty+",aditional_quantity="+aditional_qty+" where popid="+req.popid;
            var updatepop = await query(updatepopquery);          
            if(updatepop.affectedRows>0){
                var checkpostatusquery = "select count(popid) as popcount,count(case when pop_status=1 then popid end) as reccount from POproducts where poid="+getpop[0].poid;
                var checkpostatus = await query(checkpostatusquery);
                if(checkpostatus.length>0){
                    if(checkpostatus[0].popcount == checkpostatus[0].reccount){
                        var updatepostatusquery = "update PO set po_status=1 where poid="+getpop[0].poid;
                        var updatepostatus = await query(updatepostatusquery);
                    }
                }

                var checkpidquery = "select * from Stock where vpid="+req.vpid;
                var checkpid = await query(checkpidquery);
                // console.log("checkpid ==>",checkpid);
                if(checkpid.length>0){
                    ////Update/////
                    var totalqty = checkpid[0].quantity+req.quantity;
                    var updatestockquery  = "update Stock set quantity="+totalqty+" where vpid="+req.vpid;
                    var updatestock = await query(updatestockquery);  
                    if(updatestock.affectedRows>0){
                        ////SCM.auto_stock_to_dayorder(req);
                        let resobj = {
                            success: true,
                            status: true,
                            message: "updated succesfully"
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
                    ////Insert/////
                    var stockdata = [];
                    stockdata.push({"vpid":req.vpid,"quantity":req.quantity});
                    Stock.createStock(stockdata,async function(err,stockres){
                        if(stockres.status==true){
                            ////SCM.auto_stock_to_dayorder(req);
                            let resobj = {
                                success: true,
                                status: true,
                                message: "updated succesfully"
                            };
                            result(null, resobj);
                        }else{
                            let resobj = {
                                success: true,
                                status: false,
                                message: "something went wrong plz try again2"
                            };
                            result(null, resobj);
                        }
                    });
                }                    
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

/////////Update PO unreceive///////////
SCM.update_po_unreceive =async function update_po_unreceive(req,result) {
    if(req.zone_id && req.popid){
        var getpopquery = "select poid,popid,vpid,(received_quantity+aditional_quantity) as total_received_quantity,sorting_status from POproducts where popid="+req.popid;
        var getpop = await query(getpopquery);
        if(getpop.length>0){
            if(getpop[0].sorting_status==0){
                var getstockquery = "select * from Stock where vpid="+getpop[0].vpid;
                var getstock = await query(getstockquery);
                if(getstock.length>0){
                    var qty = parseInt(getstock[0].quantity) - parseInt(getpop[0].total_received_quantity);
                    var updatestockquery = "update Stock set quantity="+qty+" where vpid="+getpop[0].vpid;
                    var updatestock = await query(updatestockquery);
                    if(updatestock.affectedRows>0){
                        var updatepopquery = "update POproducts set pop_status=0,received_quantity=0,aditional_quantity=0 where popid="+req.popid;
                        var updatepopquery = await query(updatepopquery);                    
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
                        message: "no stock"
                    };
                    result(null, resobj);
                }
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "pop already moved to sorting"
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

/////////View PO/////////////
SCM.view_po =async function view_po(req,result) {
    if(req.zone_id && req.poid){   
        var poviewquery = "select po.poid,po.vid,ven.name as vendor_name,po.cost,po.zoneid,po.po_status,po.created_at,po.updated_at,JSON_ARRAYAGG(JSON_OBJECT('popid',pop.popid,'poid',pop.poid,'prid',pop.prid,'vpid',pop.vpid,'product_name',pm.Productname,'vid',pop.vid,'vendor_name',ven.name,'cost',pop.cost,'other_charges',pop.other_charges,'requested_quantity',pop.requested_quantity,'received_quantity',pop.received_quantity,'aditional_quantity',pop.aditional_quantity,'pop_status',pop.pop_status,'due_date',pop.due_date,'buyer_comment',pop.buyer_comment,'delivery_note',pop.delivery_note,'sorting_status',pop.sorting_status,'created_at',pop.created_at,'updated_at',pop.updated_at)) as products from PO as po left join POproducts as pop on pop.poid=po.poid left join Vendor_products_mapping as vpm on vpm.vid=po.vid left join Vendor as ven on ven.vid=po.vid left join Product_live as pl on pl.vpid=pop.vpid left join ProductMaster as pm on pm.pid=pl.pid where po.poid="+req.poid;
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

/////////Delete PO///////////
SCM.delete_po =async function delete_po(req,result) {
    if(req.zone_id && req.poid){  
        var getpoquery = "select * from PO where zoneid="+req.zone_id+" and poid="+req.poid;
        var getpo = await query(getpoquery);
        if(getpo.length>0){
            let resobj = { };
            //console.log("getpo[0].po_status==>",getpo[0].po_status);
            switch (getpo[0].po_status) {
                case 0:
                    //////Update PO///////////////
                    var getpopquery = "select count(pop.popid) as total_count,count(case when pop.pop_status=0 then pop.popid end) as open_count from PO as po left join POproducts as pop on pop.poid=po.poid where po.zoneid="+req.zone_id+" and pop.poid="+req.poid;
                    var getpop = await query(getpopquery);
                    if(getpop.length>0){
                        if(getpop[0].total_count == getpop[0].open_count){
                            var updatepoquery = "update PO set po_status=4 where zoneid="+req.zone_id+" and poid="+req.poid;
                            var updatepo = await query(updatepoquery);

                            var updatepoquery = "update POproducts set pop_status=4 where poid="+req.poid;
                            var updatepo = await query(updatepoquery);
                            if(updatepo.affectedRows>0){
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
    if(req.zone_id && req.poid){  
        var getpoquery = "select * from PO where zoneid="+req.zone_id+" and poid="+req.poid;
        var getpo = await query(getpoquery);
        if(getpo.length>0){
            let resobj = { };
            //console.log("getpo[0].po_status==>",getpo[0].po_status);
            switch (getpo[0].po_status) {
                case 0:
                case 1:
                    //////Update PO///////////////
                    var getpopquery = "select count(pop.popid) as total_count,count(case when pop.pop_status=1 then pop.popid end) as received_count from PO as po left join POproducts as pop on pop.poid=po.poid where po.zoneid="+req.zone_id+" and pop.poid="+req.poid;
                    var getpop = await query(getpopquery);
                    if(getpop.length>0){
                        if((getpop[0].total_count>0 && getpop[0].received_count>0) && (getpop[0].total_count != getpop[0].received_count)){
                            var updatepoquery = "update PO set po_status=3 where zoneid="+req.zone_id+" and poid="+req.poid;
                            var updatepo = await query(updatepoquery);

                            var updatepoquery = "update POproducts set pop_status=3 where poid="+req.poid;
                            var updatepo = await query(updatepoquery);
                            if(updatepo.affectedRows>0){
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
                        }else if((getpop[0].total_count>0 && getpop[0].received_count>0) && (getpop[0].total_count == getpop[0].received_count)){
                            resobj = {
                                success: true,
                                status: false,
                                message: "already received"
                            };
                            result(null, resobj);
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

/////////Delete POtemp///////////
SCM.delete_po_temp =async function delete_po_temp(req,result) {
    if(req.zone_id && req.temppoid){   
        var potempquery = "select * from POtemp where zoneid="+req.zone_id+" and tempid="+req.temppoid;
        var potemp = await query(potempquery);
        if(potemp.length>0){
            var updatepotempquery = "update POtemp set delete_status=1 where zoneid="+req.zone_id+" and tempid="+req.temppoid;
            var updatepotemp = await query(updatepotempquery);
            if(updatepotemp.affectedRows>0){
                var updateprocurmentquery = "update Procurement set pr_status=1 where zoneid="+req.zone_id+" and prid="+potemp[0].prid;
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

/////Auto stock to dayorder product assign//////
SCM.auto_stock_to_dayorder =async function auto_stock_to_dayorder(req) {
    // console.log("update_dayorders-->1");
    var getstocksquery = "select * from Stock where quantity !=0";
    var getstocks = await query(getstocksquery);

    if(getstocks.length > 0){
        for (let i = 0; i < getstocks.length; i++) {
            var getdayorderproductsquery = "select * from Dayorder_products where vpid="+getstocks[i].vpid+" order by created_at";
            var getdayorderproducts = await query(getdayorderproductsquery);

            if(getdayorderproducts.length > 0){
                for (let j = 0; j < getdayorderproducts.length && getstocks[i].quantity>0; j++) {
                    if(getdayorderproducts[j].vpid == getstocks[i].vpid && getdayorderproducts[j].sorting_status != 2){
                        if(getdayorderproducts[j].quantity >= getdayorderproducts[j].received_quantity){
                            var qty = parseInt(getdayorderproducts[j].quantity) - parseInt(getdayorderproducts[j].received_quantity);
                            if(getstocks[i].quantity >= qty){
                                var updateDOPquery = "update Dayorder_products set scm_status=3,received_quantity="+qty+" where id="+getdayorderproducts[j].id;
                                var updateDOP = await query(updateDOPquery);
                                getstocks[i].quantity = parseInt(getstocks[i].quantity) - parseInt(qty);
                            }                            
                        }
                    }
                }
                var updatestockquery = "update Stock set quantity="+getstocks[i].quantity+" where vpid="+getstocks[i].vpid;
                var updatestock = await query(updatestockquery);
            }         
        }
        let resobj = {
            success: true,
            status: true,
            message: "stock updated successfully"
        };
        // console.log("resobj-->2",resobj);
        return resobj;
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "no stock"
        };
        // console.log("resobj-->2",resobj);
        return resobj;
    }
};

/////PO to DayOrder with Sorting////////////////
SCM.pop_to_dayorder =async function pop_to_dayorder(req, result) {
    if(req.zone_id && req.popid){
        var getpopquery = "select *,(received_quantity+aditional_quantity) as total_received_quantity from POproducts where popid="+req.popid;
        var getpop = await query(getpopquery);
        if(getpop.length>0){
            if(getpop[0].total_received_quantity >0){
                if(getpop[0].sorting_status==0){
                    var getstockquery = "select * from Stock where vpid="+getpop[0].vpid;
                    var getstock = await query(getstockquery);
                    if(getstock.length>0){
                        var getdayorderproductquery = "select * from Dayorder_products where scm_status=2 and vpid="+getpop[0].vpid+" order by created_at";
                        var getdayorderproduct = await query(getdayorderproductquery);
                        if(getdayorderproduct.length>0){
                            for (let i = 0; i < getdayorderproduct.length && getstock[0].quantity>0; i++) {
                                if(getdayorderproduct[i].quantity >= getdayorderproduct[i].received_quantity){
                                    var qty = parseInt(getdayorderproduct[i].quantity) - parseInt(getdayorderproduct[i].received_quantity);
                                    if(getstock[0].quantity >= qty){
                                        var updateDOPquery = "update Dayorder_products set scm_status=3,received_quantity="+qty+",popid="+req.popid+" where id="+getdayorderproduct[i].id;
                                        var updateDOP = await query(updateDOPquery);
                                        getstock[0].quantity = parseInt(getstock[0].quantity) - parseInt(qty);
                                    }
                                }                        
                            }
                            var updatestockquery = "update Stock set quantity="+getstock[0].quantity+" where vpid="+getstock[0].vpid;
                            var updatestock = await query(updatestockquery);
                            
                            var updatepopquery = "update POproducts set sorting_status=1 where popid="+req.popid;
                            var updatepop = await query(updatepopquery);
                            
                            if(updatestock.affectedRows>0 && updatepop.affectedRows>0){
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
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "already move to soring"
                    };
                    result(null, resobj);
                }                
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "plz check received quantity"
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
            message: "fill all required fields"
        };
        result(null, resobj);
    }
};

/////////Get Sorting List///////////
SCM.get_soring_list =async function get_soring_list(req,result) {
    if(req.zone_id){
        var where = "";
        if(req.doid){
            where = where+" and dayo.id="+req.doid;
        }
        if(req.date){
            where = where+" and date(dayo.date)='"+req.date+"' ";
        }

        var getpolistquery = "select dayo.date,dayo.id as doid,dayo.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid', dop.vpid,'product_name',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'sorting_status',dop.sorting_status,'scm_status',dop.scm_status,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight))) AS products,0 as actival_weight,0 as received_weight,0 as action from Dayorder as dayo left join Dayorder_products as dop on dop.doid=dayo.id where dayo.dayorderstatus=1 and dop.scm_status<=3 and dayo.zoneid="+req.zone_id+" "+where+" group by dayo.id";        
        var getpolist = await query(getpolistquery);
        if(getpolist.length > 0){
            for (let i = 0; i < getpolist.length; i++) {
                getpolist[i].products = JSON.parse(getpolist[i].products);
                var productlist = getpolist[i].products;
                for (let j = 0; j < productlist.length; j++) {
                    getpolist[i].actival_weight = parseInt(getpolist[i].actival_weight)+parseInt(productlist[j].actival_weight);
                    getpolist[i].received_weight =parseInt(getpolist[i].received_weight)+parseInt(productlist[j].received_weight);  
                }

                var checkscmquery = "select count(id) as dop_count,count(case when scm_status>=2 then id end) as scm2_count,count(case when received_quantity>0 then id end) as recevied_count from Dayorder_products where doid="+getpolist[i].doid;        
                var checkscm = await query(checkscmquery);
                if(checkscm.length>0){
                    if(checkscm[0].recevied_count>0){
                        getpolist[i].action = 1;
                    }
                }
            }            
            if(getpolist[0].actival_weight > 0 || getpolist[0].received_weight > 0){
                let resobj = {
                    success: true,
                    status: true,
                    result: getpolist
                };
                result(null, resobj);
            }            
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
    if(req.dopid_list){
        var error_poid= [];
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
            }else{
                error_poid.push(req.dopid_list[i]);
            }       
        }

        let resobj = {
            success: true,
            status: true,
            message: "moved to QA",
            error_msg: error_poid+" plz sort this dayorder products"
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

////////Get Quality Type List/////////////
SCM.quality_type_list =async function quality_type_list(req,result) {
    var QA_typesquery = "select * from QA_types";
    var getpolist = await query(QA_typesquery);
    if(getpolist.length > 0){
        let resobj = {
            success: true,
            status: true,
            result: getpolist
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
        for (let i = 0; i < req.checklist.length; i++) {
            var Quality = [];
            Quality = req.checklist[i].qaid;            
            for (let j = 0; j <  Quality.length; j++) {           
                var check_list = {};
                check_list.vpid =  req.checklist[i].vpid;
                check_list.qaid = Quality[j];
                check_list.doid = req.doid;
              
                var new_check_list = new QA_check_list(check_list);
                QA_check_list.create_qa_check_list(new_check_list, function(err, res2) {
                  if (err) { 
                    sql.rollback(function() {                     
                      result(err, null);
                    });
                  }
                });                
            }           
        }
        var update = await query("update Dayorder_products set scm_status=5 where doid = '"+req.doid+"'");
        var updateDO = await query("update Dayorder set dayorderstatus=6 where id = '"+req.doid+"'");
        let resobj = {
            success: true,
            status: true,
            message: "Product Quality chcek has been done"
        };
        result(null, resobj);
    } else {        
        var update_revoke = await query("update Dayorder_products set scm_status=3 where doid = '"+req.doid+"'");
        let resobj = {
            success: true,
            status: true,
            message: "Product Revoke has been done"
        };
        result(null, resobj);
    }
};

module.exports = SCM;