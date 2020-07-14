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
var MoveitUser = require('../tableModels/moveituserTableModel.js');
var MoveitTrip = require('../tableModels/moveittripTableModel.js');


var Logistics = function(stockkeeping) {};

//////////show Stockkeeping Open List///////////
Logistics.ready_to_dispatch_list =async function ready_to_dispatch_list(req,result) {
    if(req.zone_id){
        var readytodispatchlistquery = "select dayo.id,dayo.userid,us.name,us.phoneno,dayo.date,dayo.created_at,sum(dop.received_quantity) as total_quantity,if(HOUR(time(dayo.created_at))>=19,'10 AM','10 AM') as eta,if(HOUR(time(dayo.created_at))>=19,'slot 2','slot 1') as eat,if(dayo.trip_id IS NOT NULL,'assgned','not assign')as status,dayo.trip_id,if(qac.qacid,'yes','no') as qac_checklist_show, JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid',dop.vpid,'productname',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight))) AS products from Dayorder as dayo left join User as us on us.userid=dayo.userid left join Dayorder_products as dop on dop.doid=dayo.id left join QA_check_list as qac on qac.doid=dayo.id where dayo.dayorderstatus=5 group by dayo.id";
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
    var qachecklistquery = "select * from QA_types";
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
        var checkqachecklistquery = "select * from QA_check_list where doid="+req.doid;
        var checkqachecklist = await query(checkqachecklistquery);
        if(checkqachecklist.length==0){
            for (let i = 0; i < req.qa_checklist.length; i++) {
                var insert_data = [];
                insert_data.push({"doid":req.doid,"qaid":req.qa_checklist[i].qaid,"qavalue":req.qa_checklist[i].qavalue});
                QACheckList.createQACheckList(insert_data[0], function(err, res2) {
                    if (err) { 
                        sql.rollback(function() {                     
                            result(err, null);
                        });
                    }
                });
            }

            var updatedayorderquery = "update Dayorder set dayorderstatus=6 where id="+req.doid;
            var updatedayorder = await query(updatedayorderquery);
            if(updatedayorder.affectedRow>0){
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
                message: "already exist"
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

/////////Add Moveit//////////
Logistics.moveit_add =async function moveit_add(req,result) {
    if(req){
        var checkemailquery = "select * from MoveitUser where email='"+req.email+"'";
        var checkemail = await query(checkemailquery);
        if(checkemail.length==0){
            var checkmobilequery = "select * from MoveitUser where phoneno='"+req.phoneno+"'";
            var checkmobile = await query(checkmobilequery);
            if(checkmobile.length==0){
                await MoveitUser.createMoveitUser(req,async function(err,moveituserres){
                    if(moveituserres.status==true){
                        let resobj = {
                            success: true,
                            status: true,
                            message: "moveit user added successfully"
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
                    message: "mobile number exist"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "emailid already exist"
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

/////////View Moveit//////////
Logistics.moveit_view =async function moveit_view(req,result) {
    if(req.userid){
        var moveituserquery = "select * from MoveitUser where userid="+req.userid;
        var moveituser = await query(moveituserquery);
        if(moveituser.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: moveituser
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

/////////Edit Moveit//////////
Logistics.moveit_edit =async function moveit_edit(req,result) {
    if(req.userid){
        var checkemailquery = "select * from MoveitUser where email='"+req.email+"' and userid NOT IN("+req.userid+")";
        var checkemail = await query(checkemailquery);
        if(checkemail.length==0){
            var checkmobilequery = "select * from MoveitUser where phoneno='"+req.phoneno+"' and userid NOT IN("+req.userid+")";
            var checkmobile = await query(checkmobilequery);
            if(checkmobile.length==0){
                await MoveitUser.updateMoveitUser(req,async function(err,moveituserres){
                    if(moveituserres.status==true){
                        let resobj = {
                            success: true,
                            status: true,
                            message: "moveit user updated successfully"
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
                    message: "mobile number exist"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "emailid already exist"
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

/////////Assign to Dunzo//////////
Logistics.assign_to_dunzo =async function assign_to_dunzo(req,result) {
    if(req.zone_id && req.doid){
        var getdayorderquery = "select * from Dayorder where id="+req.doid;
        var getdayorder = await query(getdayorderquery);
        if(getdayorder.length>0){
            if(getdayorder[0].dayorderstatus==6){
                if(getdayorder[0].moveit_type==NULL){
                    var updatedayorderquery = "update Dayorder set moveit_type=2 where id="+req.doid;
                    var updatedayorder = await query(updatedayorderquery);
                    if(updatedayorder.affectedRow>0){
                        let resobj = {
                            success: true,
                            status: true,
                            message: "Order successfully assigned to  dunzo"
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
                        message: "already moveit assigned"
                    };
                    result(null, resobj);
                }
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "plz check day order status"
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

///////// Create Moveit Trip //////////
Logistics.create_moveit_trip =async function create_moveit_trip(req,result) {
    if(req.zone_id && req.doid.length>0 && req.moveit_id){
        var moveittripdata = [];
        moveittripdata.push({"moveit_id":req.moveit_id});
        await MoveitTrip.createMovietTrip(moveittripdata[0],async function(err,moveittripres){
            if(moveittripres.status==true){
                var dayorderids = req.doid;
                for (let i = 0; i < dayorderids.length; i++) {
                    var updatedayorderquery = "update Dayorder set trip_id="+moveittripres.result.insertId+",moveit_type=1 where id="+dayorderids[i];
                    var updatedayorder = await query(updatedayorderquery);                   
                }
                let resobj = {
                    success: true,
                    status: true,
                    message: "trip created Successfully"
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

/////////Moveit Trip List//////////
Logistics.moveit_trip_list =async function moveit_trip_list(req,result) {
    var moveittriplistquery = "select * from Dayorder where moveit_type=1 order by id desc";
    var moveittriplist = await query(moveittriplistquery);
    if(moveittriplist.length > 0){            
        let resobj = {
            success: true,
            status: true,
            result: moveittriplist
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

/////////Dunzo Order List//////////
Logistics.dunzo_trip_list =async function dunzo_trip_list(req,result) {
    var dunzoorderlistquery = "select * from Dayorder where moveit_type=2 order by id desc";
    var dunzoorderlist = await query(dunzoorderlistquery);
    if(dunzoorderlist.length > 0){            
        let resobj = {
            success: true,
            status: true,
            result: dunzoorderlist
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