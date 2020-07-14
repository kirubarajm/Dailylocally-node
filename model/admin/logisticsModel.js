"user strict";
var sql     = require('../db.js');
const util  = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant= require('../constant.js');
var request = require('request');
let jwt     = require('jsonwebtoken');
let config  = require('../config.js');
var moment  = require('moment');
var QACheckList = require('../tableModels/qachecklistTableModel.js');
var ProductLive = require('../tableModels/productliveTableModel.js');


var Logistics = function(stockkeeping) {};

//////////show Stockkeeping Open List///////////
Logistics.ready_to_dispatch_list =async function ready_to_dispatch_list(req,result) {
    if(req.zone_id){
        var readytodispatchlistquery = "select dayo.id,dayo.userid,us.name,us.phoneno,dayo.date,dayo.created_at,sum(dop.received_quantity) as total_quantity,if(HOUR(time(dayo.created_at))>=19,'10 AM','10 AM') as eta,if(HOUR(time(dayo.created_at))>=19,'slot 2','slot 1') as eat,if(dayo.trip_id IS NOT NULL,'assgned','not assign')as status,dayo.trip_id,if(qac.qacid,'yes','no') as qac_checklist_show, JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid',dop.vpid,'productname',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight))) AS products from Dayorder as dayo left join User as us on us.userid=dayo.userid left join Dayorder_products as dop on dop.doid=dayo.id left join QA_check_list as qac on qac.doid=dayo.id where dayo.dayorderstatus=6 group by dayo.id";
        var readytodispatchlist = await query(readytodispatchlistquery);
        if(readytodispatchlist.length > 0){
            for (let i = 0; i < readytodispatchlist.length; i++) {
                readytodispatchlist[i].products = JSON.parse(readytodispatchlist[i].products); 
                var productlist = readytodispatchlist[i].products;
                for (let j = 0; j < productlist.length; j++) {
                    readytodispatchlist[i].actival_weight = parseInt(readytodispatchlist[i].actival_weight)+parseInt(productlist[j].actival_weight);
                    readytodispatchlist[i].received_weight =parseInt(readytodispatchlist[i].received_weight)+parseInt(productlist[j].received_weight);
                }             
            }
            let resobj = {
                success: true,
                status: true,
                result: readytodispatchlist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no data found"
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

/////////Get QC Type List///////////
Logistics.qa_type_list =async function qa_type_list(req,result) {
    // var qachecklistquery = "select * from QA_types";
    // var qachecklist = await query(qachecklistquery);
    // if(qachecklist.length > 0){            
    //     let resobj = {
    //         success: true,
    //         status: true,
    //         result: qachecklist
    //     };
    //     result(null, resobj);
    // }else{
    //     let resobj = {
    //         success: true,
    //         status: false,
    //         message: "no data found"
    //     };
    //     result(null, resobj);
    // }      


    var qachecklistquery = "select * from ProductMaster";
    var qachecklist = await query(qachecklistquery);
    if(qachecklist.length > 0){  
        for (let i = 0; i < qachecklist.length; i++) {
            for (let j = 1; j < 3; j++) {                
                let senddata = [];
                senddata.push({"zoneid":j,"pid":qachecklist[i].pid,"live_status":0});
                ProductLive.createProductLive(senddata[0], async function(err,productliveres){  });                                                       
            }
                        
        }          
        let resobj = {
            success: true,
            status: true,
            result: qachecklist
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "no data found"
        };
        result(null, resobj);
    } 
};

/////////Save QA Check List///////////
Logistics.save_qa_checklist =async function save_qa_checklist(req,result) {
    if(req.zone_id && req.doid && req.qa_checklist.length>0){
        for (let i = 0; i < req.qa_checklist.length; i++) {
            var insert_data = [];
            insert_data.push({"doid":req.doid,"qaid":req.qa_checklist[i]});
            var checkqachecklistquery = "select * from QA_check_list where doid="+req.doid+" and qaid="+req.qa_checklist[i]+" and delete_status=0";
            var checkqachecklist = await query(checkqachecklistquery);
            if(checkqachecklist.length>0){
                var deleteqachecklistquery = "update QA_check_list set delete_status=1 where qacid="+checkqachecklist[0].qacid;
                var deleteqachecklist = await query(deleteqachecklistquery);
                QACheckList.createQACheckList(insert_data, function(err, res2) {
                    if (err) { 
                        sql.rollback(function() {                     
                            result(err, null);
                        });
                    }
                });
            }else{
                QACheckList.createQACheckList(insert_data, function(err, res2) {
                    if (err) { 
                        sql.rollback(function() {                     
                            result(err, null);
                        });
                    }
                });  
            }
        }
        var update_dayorderquery = "update Dayorder set qa_check_status=1 where id="+req.doid;
        var update_dayorder = await query(update_dayorderquery);
        if(update_dayorder.affectedRow>0){
            let resobj = {
                success: true,
                status: true,
                message: "QA Checklist Submitted Successfully"
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
            message: "please check post values"
        };
        result(null, resobj);
    } 
};

/////////Submit QA Check List///////////
Logistics.submit_qa_checklist =async function submit_qa_checklist(req,result) {
    if(req.zone_id && req.doid && req.qa_checklist.length>0){
        for (let i = 0; i < req.qa_checklist.length; i++) {
            var insert_data = [];
            insert_data.push({"doid":req.doid,"qaid":req.qa_checklist[i]});
            QACheckList.createQACheckList(insert_data, function(err, res2) {
                if (err) { 
                    sql.rollback(function() {                     
                        result(err, null);
                    });
                }
            });
        }
        let resobj = {
            success: true,
            status: true,
            message: "QA Checklist Submitted Successfully"
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "please check post values"
        };
        result(null, resobj);
    } 
};

/////////Get Moveit List///////////
Logistics.get_moveit_list =async function get_moveit_list(req,result) {
    var qachecklistquery = "select * from MoveitUser";
    var qachecklist = await query(qachecklistquery);
    if(qachecklist.length > 0){
        let resobj = {
            success: true,
            status: true,
            result: qachecklist
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "no data found"
        };
        result(null, resobj);
    } 
};

module.exports = Logistics;